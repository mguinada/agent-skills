# Refactoring Patterns Reference

Supplementary patterns for specialized refactoring scenarios.

## Prompt Refactoring Patterns

When code contains prompts or prompt templates, apply these patterns.

### Extract Prompt Template

**Python:**
```python
# Before - Prompt embedded in code
def generate_response(topic):
    prompt = f"""You are an expert on {topic}. Please provide a detailed explanation
of the key concepts, history, and modern applications. Include specific examples
and make it accessible to beginners."""
    return llm.complete(prompt)

# After - Extracted template
EXPERT_SYSTEM_PROMPT = """You are an expert on {topic}.

Provide a detailed explanation covering:
- Key concepts
- Historical context
- Modern applications

Include specific examples and keep it accessible to beginners."""

def generate_response(topic: str) -> str:
    return llm.complete(EXPERT_SYSTEM_PROMPT.format(topic=topic))
```

**Ruby:**
```ruby
# Before - Prompt embedded in code
def generate_response(topic)
  prompt = "You are an expert on #{topic}. Please provide a detailed explanation
of the key concepts, history, and modern applications. Include specific examples
and make it accessible to beginners."
  llm.complete(prompt)
end

# After - Extracted template
EXPERT_SYSTEM_PROMPT = <<~PROMPT
  You are an expert on %{topic}.

  Provide a detailed explanation covering:
  - Key concepts
  - Historical context
  - Modern applications

  Include specific examples and keep it accessible to beginners.
PROMPT

def generate_response(topic)
  llm.complete(EXPERT_SYSTEM_PROMPT % { topic: topic })
end
```

---

### Extract Few-Shot Examples

**Python:**
```python
# Before - Examples inline
def classify_sentiment(text):
    prompt = f"""Classify sentiment.

Example 1: "I love this!" -> positive
Example 2: "This is terrible." -> negative

Input: "{text}" """
    return llm.complete(prompt)

# After - Examples extracted
SENTIMENT_EXAMPLES = [
    ("I love this!", "positive"),
    ("This is terrible.", "negative"),
]

def build_few_shot_prompt(examples, input_text):
    examples_text = "\n".join(
        f'Example {i+1}: "{ex}" -> {label}'
        for i, (ex, label) in enumerate(examples)
    )
    return f"Classify sentiment.\n\n{examples_text}\n\nInput: \"{input_text}\""

def classify_sentiment(text):
    return llm.complete(build_few_shot_prompt(SENTIMENT_EXAMPLES, text))
```

**Ruby:**
```ruby
# Before - Examples inline
def classify_sentiment(text)
  prompt = "Classify sentiment.\n\n" \
           "Example 1: \"I love this!\" -> positive\n" \
           "Example 2: \"This is terrible.\" -> negative\n\n" \
           "Input: \"#{text}\""
  llm.complete(prompt)
end

# After - Examples extracted
SENTIMENT_EXAMPLES = [
  ["I love this!", "positive"],
  ["This is terrible.", "negative"],
].freeze

def build_few_shot_prompt(examples, input_text)
  examples_text = examples.each_with_index.map do |(text, label), i|
    "Example #{i + 1}: \"#{text}\" -> #{label}"
  end.join("\n")
  "Classify sentiment.\n\n#{examples_text}\n\nInput: \"#{input_text}\""
end

def classify_sentiment(text)
  llm.complete(build_few_shot_prompt(SENTIMENT_EXAMPLES, text))
end
```

---

## SOLID Principle Refactorings

### Single Responsibility Principle

**Python:**
```python
# Before - Multiple responsibilities
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    def save(self):
        db.users.insert(self)

    def send_email(self, subject, body):
        mailer.send(self.email, subject, body)

# After - Separated responsibilities
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

class UserRepository:
    def save(self, user):
        db.users.insert(user)

class EmailService:
    def send(self, user, subject, body):
        mailer.send(user.email, subject, body)
```

**Ruby:**
```ruby
# Before - Multiple responsibilities
class User
  attr_accessor :name, :email

  def save
    DB[:users].insert(to_h)
  end

  def send_email(subject, body)
    Mailer.deliver(email, subject, body)
  end
end

# After - Separated responsibilities
class User
  attr_accessor :name, :email
end

class UserRepository
  def save(user)
    DB[:users].insert(user.to_h)
  end
end

class EmailService
  def send(user, subject, body)
    Mailer.deliver(user.email, subject, body)
  end
end
```

---

### Open/Closed Principle

**Python:**
```python
# Before - Modifies existing code for new types
class DiscountCalculator:
    def calculate(self, customer_type, amount):
        if customer_type == "regular":
            return amount
        elif customer_type == "premium":
            return amount * 0.9
        elif customer_type == "vip":
            return amount * 0.8

# After - Open for extension, closed for modification
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    @abstractmethod
    def apply(self, amount): pass

class RegularDiscount(DiscountStrategy):
    def apply(self, amount): return amount

class PremiumDiscount(DiscountStrategy):
    def apply(self, amount): return amount * 0.9

class VipDiscount(DiscountStrategy):
    def apply(self, amount): return amount * 0.8

class DiscountCalculator:
    strategies = {
        "regular": RegularDiscount(),
        "premium": PremiumDiscount(),
        "vip": VipDiscount(),
    }

    def calculate(self, customer_type, amount):
        return self.strategies[customer_type].apply(amount)
```

**Ruby:**
```ruby
# Before - Modifies existing code for new types
class DiscountCalculator
  def calculate(customer_type, amount)
    case customer_type
    when "regular" then amount
    when "premium" then amount * 0.9
    when "vip" then amount * 0.8
    end
  end
end

# After - Open for extension, closed for modification
class DiscountStrategy
  def apply(amount)
    raise NotImplementedError
  end
end

class RegularDiscount < DiscountStrategy
  def apply(amount)
    amount
  end
end

class PremiumDiscount < DiscountStrategy
  def apply(amount)
    amount * 0.9
  end
end

class VipDiscount < DiscountStrategy
  def apply(amount)
    amount * 0.8
  end
end

class DiscountCalculator
  STRATEGIES = {
    "regular" => RegularDiscount.new,
    "premium" => PremiumDiscount.new,
    "vip" => VipDiscount.new,
  }.freeze

  def calculate(customer_type, amount)
    STRATEGIES[customer_type].apply(amount)
  end
end
```

---

### Dependency Inversion Principle

**Python:**
```python
# Before - High-level module depends on low-level
class NotificationService:
    def __init__(self):
        self.email_sender = EmailSender()
        self.sms_sender = SMSSender()

    def notify(self, user, message):
        self.email_sender.send(user.email, message)
        self.sms_sender.send(user.phone, message)

# After - Depends on abstractions
class MessageSender(ABC):
    @abstractmethod
    def send(self, recipient, message): pass

class EmailSender(MessageSender):
    def send(self, recipient, message):
        # Implementation

class SMSSender(MessageSender):
    def send(self, recipient, message):
        # Implementation

class NotificationService:
    def __init__(self, senders: list[MessageSender]):
        self.senders = senders

    def notify(self, user, message):
        for sender in self.senders:
            sender.send(user.contact_for(sender), message)
```

**Ruby:**
```ruby
# Before - High-level module depends on low-level
class NotificationService
  def initialize
    @email_sender = EmailSender.new
    @sms_sender = SMSSender.new
  end

  def notify(user, message)
    @email_sender.send(user.email, message)
    @sms_sender.send(user.phone, message)
  end
end

# After - Depends on abstractions
class NotificationService
  def initialize(senders)
    @senders = senders
  end

  def notify(user, message)
    @senders.each do |sender|
      sender.send(user.contact_for(sender), message)
    end
  end
end

# Protocol (Ruby 3+) or Duck Typing
class EmailSender
  def send(recipient, message)
    # Implementation
  end
end

class SMSSender
  def send(recipient, message)
    # Implementation
  end
end
```

---

## Functional Refactorings

### Replace Loop with Pipeline

**Python:**
```python
# Before
result = []
for item in items:
    if item.is_active:
        result.append(item.price * 1.1)

# After
result = [item.price * 1.1 for item in items if item.is_active]

# Or with functional style
from operator import attrgetter
result = list(map(
    lambda p: p * 1.1,
    filter(lambda i: i.is_active, items),
    attrgetter('price')
))
```

**Ruby:**
```ruby
# Before
result = []
items.each do |item|
  if item.active?
    result << item.price * 1.1
  end
end

# After
result = items.select(&:active?).map { |i| i.price * 1.1 }
```

---

### Replace Mutation with Transformation

**Python:**
```python
# Before - Mutating
def apply_discounts(orders):
    for order in orders:
        if order.total > 100:
            order.total *= 0.9
    return orders

# After - Transforming
@dataclass
class Order:
    total: float

def apply_discounts(orders):
    return [
        Order(order.total * 0.9) if order.total > 100 else order
        for order in orders
    ]
```

**Ruby:**
```ruby
# Before - Mutating
def apply_discounts(orders)
  orders.each do |order|
    order.total *= 0.9 if order.total > 100
  end
  orders
end

# After - Transforming
Order = Struct.new(:total)

def apply_discounts(orders)
  orders.map do |order|
    if order.total > 100
      Order.new(order.total * 0.9)
    else
      order
    end
  end
end
```
