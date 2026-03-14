# Rails Active Job Reference

Detailed patterns for background jobs.

## Table of Contents
- [Creating Jobs](#creating-jobs)
- [Enqueuing Jobs](#enqueuing-jobs)
- [Queues and Priority](#queues-and-priority)
- [Retries and Error Handling](#retries-and-error-handling)
- [Callbacks](#callbacks)
- [Serializers](#serializers)
- [Solid Queue](#solid-queue)
- [Testing Jobs](#testing-jobs)

---

## Creating Jobs

### Generator
```bash
rails generate job process_image
rails generate job guests_cleanup --queue urgent
```

### Job Structure
```ruby
# app/jobs/process_image_job.rb
class ProcessImageJob < ApplicationJob
  queue_as :default

  def perform(image_id, options = {})
    image = Image.find(image_id)
    ImageProcessor.call(image, options)
  rescue ImageNotFound => e
    Rails.logger.warn "Image not found: #{image_id}"
  end
end
```

### ApplicationJob Base
```ruby
# app/jobs/application_job.rb
class ApplicationJob < ActiveJob::Base
  # Automatically retry on failure
  retry_on StandardError, wait: 5.seconds, attempts: 3

  # Discard specific errors
  discard_on ActiveJob::DeserializationError

  # Global callback
  around_perform :log_duration

  private

  def log_duration
    start = Time.current
    yield
    Rails.logger.info "Job took #{Time.current - start}s"
  end
end
```

---

## Enqueuing Jobs

### perform_later (Async)
```ruby
# Enqueue for background processing
ProcessImageJob.perform_later(image.id)

# With arguments
ProcessImageJob.perform_later(image.id, size: 'large')

# Returns the job instance (check if enqueued)
job = ProcessImageJob.perform_later(image.id)
job.successfully_enqueued?  # true/false
```

### perform_now (Synchronous)
```ruby
# Execute immediately in current process
ProcessImageJob.perform_now(image.id)
```

### set with Options
```ruby
# Wait before executing
ProcessImageJob.set(wait: 1.hour).perform_later(image.id)

# Execute at specific time
ProcessImageJob.set(wait_until: Date.tomorrow.noon).perform_later(image.id)

# Custom queue
ProcessImageJob.set(queue: 'high_priority').perform_later(image.id)

# Custom priority
ProcessImageJob.set(priority: 10).perform_later(image.id)

# Combined
ProcessImageJob.set(wait: 5.minutes, queue: 'urgent').perform_later(image.id)
```

### Bulk Enqueuing
```ruby
# Enqueue multiple jobs efficiently
jobs = users.map { |user| CleanupJob.new(user.id) }
ActiveJob.perform_all_later(jobs)

# With options
jobs = users.map { |user| CleanupJob.new(user.id).set(wait: 1.hour) }
ActiveJob.perform_all_later(jobs)
```

---

## Queues and Priority

### Queue Assignment
```ruby
class ProcessImageJob < ApplicationJob
  queue_as :images          # Static queue
  queue_as { high_priority? ? :urgent : :default }  # Dynamic
end

# Global prefix
# config/application.rb
config.active_job.queue_name_prefix = Rails.env
# Results in: production_images, development_images
```

### Priority
```ruby
class CleanupJob < ApplicationJob
  queue_with_priority 10    # Lower = higher priority
  queue_with_priority { urgent? ? 1 : 10 }  # Dynamic
end

# Or when enqueuing
CleanupJob.set(priority: 1).perform_later
```

### Queue Configuration
```ruby
# config/queue.yml (Solid Queue)
default: &default
  dispatchers:
    - polling_interval: 1
      batch_size: 500
  workers:
    - queues: "*"           # All queues
      threads: 3
      processes: 1
    - queues: "urgent,mailers"  # Specific queues
      threads: 5
```

---

## Retries and Error Handling

### retry_on
```ruby
class ProcessImageJob < ApplicationJob
  # Retry on specific error
  retry_on StandardError, wait: 5.seconds, attempts: 3

  # Exponential backoff
  retry_on NetworkError, wait: :exponentially_longer, attempts: 5

  # Custom wait calculation
  retry_on CustomError, wait: ->(attempts) { attempts ** 2 }, attempts: 3

  # With block (executed on final failure)
  retry_on StandardError, attempts: 3 do |job, error|
    Rails.logger.error "Job failed after retries: #{error.message}"
    AdminMailer.job_failed(job, error).deliver_later
  end
end
```

### discard_on
```ruby
class ProcessImageJob < ApplicationJob
  # Discard without retry
  discard_on ActiveJob::DeserializationError
  discard_on ImageNotFoundError

  # With block
  discard_on CustomError do |job, error|
    Rails.logger.info "Discarded: #{error.message}"
  end
end
```

### rescue_from
```ruby
class ProcessImageJob < ApplicationJob
  rescue_from(StandardError) do |exception|
    Rails.error.report(exception)
    Bugsnag.notify(exception)
    raise exception  # Re-raise to mark as failed
  end

  rescue_from(ImageTooLargeError) do |exception|
    # Handle gracefully
    Rails.logger.warn "Image too large: #{exception.message}"
  end
end
```

---

## Callbacks

### Available Callbacks
```ruby
before_enqueue
after_enqueue
around_enqueue
before_perform
after_perform
around_perform
```

### Usage
```ruby
class ProcessImageJob < ApplicationJob
  before_enqueue :log_enqueue
  after_perform :cleanup
  around_perform :track_duration

  def perform(image_id)
    # ...
  end

  private

  def log_enqueue
    Rails.logger.info "Enqueuing job for image #{arguments.first}"
  end

  def cleanup
    Rails.cache.delete("temp_image_#{arguments.first}")
  end

  def track_duration
    start = Time.current
    yield
    Rails.logger.info "Job completed in #{Time.current - start}s"
  end
end
```

---

## Serializers

### Custom Serializers
For types not supported by default.

```ruby
# app/serializers/money_serializer.rb
class MoneySerializer < ActiveJob::Serializers::ObjectSerializer
  def serialize(money)
    super(
      "amount" => money.amount,
      "currency" => money.currency
    )
  end

  def deserialize(hash)
    Money.new(hash["amount"], hash["currency"])
  end

  def klass
    Money
  end
end
```

### Registering Serializers
```ruby
# config/initializers/custom_serializers.rb
Rails.application.config.active_job.custom_serializers << MoneySerializer

# Autoload path for serializers
# config/application.rb
config.autoload_once_paths << "#{root}/app/serializers"
```

### Supported Types by Default
- Basic types: `NilClass`, `String`, `Integer`, `Float`, `BigDecimal`, `TrueClass`, `FalseClass`
- `Symbol`, `Date`, `Time`, `DateTime`
- `ActiveSupport::TimeWithZone`, `ActiveSupport::Duration`
- `Hash`, `ActiveSupport::HashWithIndifferentAccess`
- `Array`, `Range`, `Module`, `Class`
- Active Record models via GlobalID

---

## Solid Queue

Default queue backend in Rails 8+.

### Configuration
```ruby
# config/environments/production.rb
config.active_job.queue_adapter = :solid_queue
config.solid_queue.connects_to = { database: { writing: :queue } }
```

### Database Setup
```yaml
# config/database.yml
production:
  primary:
    <<: *default
    database: storage/production.sqlite3
  queue:
    <<: *default
    database: storage/production_queue.sqlite3
    migrations_paths: db/queue_migrate
```

### Starting Workers
```bash
# Start Solid Queue
bin/jobs start

# Or via rake
rake solid_queue:start
```

### Recurring Tasks (Cron)
```yaml
# config/recurring.yml
production:
  daily_cleanup:
    class: CleanupJob
    args: [ 'daily' ]
    schedule: every day at 3am

  hourly_stats:
    class: StatsJob
    schedule: every hour
```

### Concurrency Controls
```ruby
class ProcessOrderJob < ApplicationJob
  # Only 2 jobs per account at a time
  limits_concurrency to: 2, key: ->(order) { order.account }, duration: 5.minutes

  # Group across job classes
  limits_concurrency key: ->(user) { user }, group: "UserActions"
end
```

### Job Continuations
For resumable long-running jobs.

```ruby
class ProcessImportJob < ApplicationJob
  include ActiveJob::Continuable

  def perform(import_id)
    @import = Import.find(import_id)

    step :initialize do
      @import.initialize_import
    end

    step :process do |step|
      @import.records.find_each(start: step.cursor) do |record|
        process_record(record)
        step.advance! from: record.id
      end
    end

    step :finalize do
      @import.finalize
    end
  end
end
```

---

## Testing Jobs

### Test Helper
```ruby
# test/test_helper.rb
ActiveJob::Base.queue_adapter = :test
```

### Assertions
```ruby
class ProcessImageJobTest < ActiveJob::TestCase
  test "job is enqueued" do
    assert_enqueued_jobs 1 do
      ProcessImageJob.perform_later(image.id)
    end
  end

  test "job is enqueued on specific queue" do
    assert_enqueued_with(job: ProcessImageJob, queue: 'images') do
      ProcessImageJob.perform_later(image.id)
    end
  end

  test "job performs correctly" do
    perform_enqueued_jobs do
      ProcessImageJob.perform_later(image.id)
    end
    assert image.processed?
  end

  test "job arguments" do
    assert_enqueued_with(job: ProcessImageJob, args: [image.id, { size: 'large' }]) do
      ProcessImageJob.perform_later(image.id, size: 'large')
    end
  end
end
```

### RSpec
```ruby
RSpec.describe ProcessImageJob, type: :job do
  it "enqueues the job" do
    expect {
      described_class.perform_later(image.id)
    }.to have_enqueued_job(described_class).with(image.id)
  end

  it "processes the image" do
    perform_enqueued_jobs do
      described_class.perform_later(image.id)
    end
    expect(image.reload).to be_processed
  end
end
```

---

## Action Mailer Integration

```ruby
# Send email in background
UserMailer.welcome(@user).deliver_later

# With wait
UserMailer.welcome(@user).deliver_later(wait: 1.hour)

# Immediately (blocking)
UserMailer.welcome(@user).deliver_now
```

---

## Best Practices

1. **Keep jobs small** — Single responsibility
2. **Use GlobalID** — Pass records, not IDs
3. **Handle failures** — Use retry_on/discard_on
4. **Idempotency** — Jobs should be safe to retry
5. **Monitor queues** — Use tools like mission_control-jobs
6. **Test jobs** — Assert enqueuing and execution
7. **Use appropriate queues** — Separate urgent/background work
8. **Log progress** — Helpful for debugging failed jobs
