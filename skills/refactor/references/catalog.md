# Refactoring Catalog

Complete catalog of refactoring patterns with Ruby and Python examples.

## Composing Methods

### Extract Method

Turn a code fragment into a method whose name explains its purpose.

**Python:**
```python
# Before
def print_owing(amount):
    print_banner()
    print(f"name: {customer_name}")
    print(f"amount: {amount}")

# After
def print_owing(amount):
    print_banner()
    print_details(amount)

def print_details(amount):
    print(f"name: {customer_name}")
    print(f"amount: {amount}")
```

**Ruby:**
```ruby
# Before
def print_owing(amount)
  print_banner
  puts "name: #{@customer_name}"
  puts "amount: #{amount}"
end

# After
def print_owing(amount)
  print_banner
  print_details(amount)
end

def print_details(amount)
  puts "name: #{@customer_name}"
  puts "amount: #{amount}"
end
```

---

### Inline Method

Put the method's body into the body of its callers and remove the method.

**Python:**
```python
# Before
def get_rating(manager):
    return 1 if more_than_five_late_deliveries(manager) else 2

def more_than_five_late_deliveries(manager):
    return manager.late_deliveries > 5

# After
def get_rating(manager):
    return 1 if manager.late_deliveries > 5 else 2
```

**Ruby:**
```ruby
# Before
def rating
  more_than_five_late_deliveries? ? 1 : 2
end

def more_than_five_late_deliveries?
  late_deliveries > 5
end

# After
def rating
  late_deliveries > 5 ? 1 : 2
end
```

---

### Extract Variable

Place the result of an expression in a temporary variable for clarity.

**Python:**
```python
# Before
def price(order):
    return order.base_price * order.quantity - \
           max(0, order.quantity - 500) * order.item_price * 0.05 + \
           min(order.base_price * order.quantity * 0.1, 100)

# After
def price(order):
    base_price = order.base_price * order.quantity
    quantity_discount = max(0, order.quantity - 500) * order.item_price * 0.05
    shipping = min(base_price * 0.1, 100)
    return base_price - quantity_discount + shipping
```

**Ruby:**
```ruby
# Before
def price
  @base_price * @quantity -
    [0, @quantity - 500].max * @item_price * 0.05 +
    [@base_price * @quantity * 0.1, 100].min
end

# After
def price
  base_price = @base_price * @quantity
  quantity_discount = [0, @quantity - 500].max * @item_price * 0.05
  shipping = [base_price * 0.1, 100].min
  base_price - quantity_discount + shipping
end
```

---

### Replace Temp with Query

Replace a temporary variable with a query method.

**Python:**
```python
# Before
def calculate_total(items):
    base_price = sum(item.price * item.quantity for item in items)
    if base_price > 1000:
        return base_price * 0.95
    return base_price

# After
def calculate_total(items):
    base_price = get_base_price(items)
    if base_price > 1000:
        return base_price * 0.95
    return base_price

def get_base_price(items):
    return sum(item.price * item.quantity for item in items)
```

**Ruby:**
```ruby
# Before
def calculate_total
  base_price = items.sum { |i| i.price * i.quantity }
  base_price > 1000 ? base_price * 0.95 : base_price
end

# After
def calculate_total
  base_price > 1000 ? base_price * 0.95 : base_price
end

def base_price
  items.sum { |i| i.price * i.quantity }
end
```

---

### Split Temporary Variable

Use separate variables for different values.

**Python:**
```python
# Before
def calculate(length, width, height):
    temp = 2 * (length * width)
    print(f"Surface area: {temp}")
    temp = height * 0.5
    print(f"Volume factor: {temp}")

# After
def calculate(length, width, height):
    surface_area = 2 * (length * width)
    print(f"Surface area: {surface_area}")
    volume_factor = height * 0.5
    print(f"Volume factor: {volume_factor}")
```

**Ruby:**
```ruby
# Before
def calculate(length, width, height)
  temp = 2 * (length * width)
  puts "Surface area: #{temp}"
  temp = height * 0.5
  puts "Volume factor: #{temp}"
end

# After
def calculate(length, width, height)
  surface_area = 2 * (length * width)
  puts "Surface area: #{surface_area}"
  volume_factor = height * 0.5
  puts "Volume factor: #{volume_factor}"
end
```

---

### Remove Assignments to Parameters

Use a temporary variable instead of assigning to a parameter.

**Python:**
```python
# Before
def discount(value, quantity, year_end):
    if quantity > 50:
        value -= 2
    if year_end:
        value -= 1
    return value

# After
def discount(value, quantity, year_end):
    result = value
    if quantity > 50:
        result -= 2
    if year_end:
        result -= 1
    return result
```

**Ruby:**
```ruby
# Before
def discount(value, quantity, year_end)
  value -= 2 if quantity > 50
  value -= 1 if year_end
  value
end

# After
def discount(value, quantity, year_end)
  result = value
  result -= 2 if quantity > 50
  result -= 1 if year_end
  result
end
```

---

### Replace Method with Method Object

Turn a long method into its own object with local variables as fields.

**Python:**
```python
# Before
class Order:
    def price(self):
        # Complex calculation with many local variables
        primary_base_price = self.primary * self.rate
        secondary_base_price = self.secondary * self.rate
        tertiary_base_price = self.tertiary * self.rate
        # ... many more calculations
        return result

# After
class Order:
    def price(self):
        return PriceCalculator(self).compute()

class PriceCalculator:
    def __init__(self, order):
        self.primary = order.primary
        self.secondary = order.secondary
        self.tertiary = order.tertiary
        self.rate = order.rate

    def compute(self):
        primary_base_price = self.primary * self.rate
        secondary_base_price = self.secondary * self.rate
        # ... calculations using instance variables
        return result
```

**Ruby:**
```ruby
# Before
class Order
  def price
    primary_base_price = primary * rate
    secondary_base_price = secondary * rate
    tertiary_base_price = tertiary * rate
    # ... many more calculations
    result
  end
end

# After
class Order
  def price
    PriceCalculator.new(self).compute
  end
end

class PriceCalculator
  def initialize(order)
    @primary = order.primary
    @secondary = order.secondary
    @tertiary = order.tertiary
    @rate = order.rate
  end

  def compute
    primary_base_price = @primary * @rate
    secondary_base_price = @secondary * @rate
    # ... calculations using instance variables
    result
  end
end
```

---

## Organizing Data

### Replace Magic Number with Symbolic Constant

Replace a magic number with a named constant.

**Python:**
```python
# Before
def potential_energy(mass, height):
    return mass * height * 9.81

# After
GRAVITY = 9.81

def potential_energy(mass, height):
    return mass * height * GRAVITY
```

**Ruby:**
```ruby
# Before
def potential_energy(mass, height)
  mass * height * 9.81
end

# After
GRAVITY = 9.81

def potential_energy(mass, height)
  mass * height * GRAVITY
end
```

---

### Replace Data Value with Object

Turn a simple data value into an object.

**Python:**
```python
# Before
class Order:
    def __init__(self, customer):
        self.customer = customer  # just a string

# After
class Customer:
    def __init__(self, name):
        self.name = name

class Order:
    def __init__(self, customer):
        self.customer = Customer(customer)
```

**Ruby:**
```ruby
# Before
class Order
  attr_accessor :customer # just a string
end

# After
class Customer
  attr_reader :name

  def initialize(name)
    @name = name
  end
end

class Order
  attr_accessor :customer # now a Customer object
end
```

---

### Change Value to Reference

Turn an object that represents a single value into a reference object.

**Python:**
```python
# Before - new object each time
class Customer:
    def __init__(self, name):
        self.name = name

order1 = Order(Customer("Acme"))
order2 = Order(Customer("Acme"))  # Different objects!

# After - shared reference
class Customer:
    _instances = {}

    def __new__(cls, name):
        if name not in cls._instances:
            cls._instances[name] = super().__new__(cls)
            cls._instances[name].name = name
        return cls._instances[name]
```

**Ruby:**
```ruby
# Before - new object each time
order1 = Order.new(Customer.new("Acme"))
order2 = Order.new(Customer.new("Acme")) # Different objects!

# After - shared reference
class Customer
  @@instances = {}

  def self.get(name)
    @@instances[name] ||= new(name)
  end

  private_class_method :new

  def initialize(name)
    @name = name
  end
end
```

---

### Replace Array with Object

Replace an array with an object that has named fields.

**Python:**
```python
# Before
row = ["Acme Corp", "123 Main St", "Seattle", "WA"]
name = row[0]  # Accessing by index is unclear
city = row[2]

# After
from dataclasses import dataclass

@dataclass
class Company:
    name: str
    address: str
    city: str
    state: str

company = Company("Acme Corp", "123 Main St", "Seattle", "WA")
name = company.name
city = company.city
```

**Ruby:**
```ruby
# Before
row = ["Acme Corp", "123 Main St", "Seattle", "WA"]
name = row[0]
city = row[2]

# After
Company = Struct.new(:name, :address, :city, :state)
company = Company.new("Acme Corp", "123 Main St", "Seattle", "WA")
name = company.name
city = company.city
```

---

### Encapsulate Collection

Make a collection private and provide accessor methods.

**Python:**
```python
# Before
class Course:
    def __init__(self):
        self.students = []  # Exposed collection

# After
class Course:
    def __init__(self):
        self._students = []

    def add_student(self, student):
        self._students.append(student)

    def remove_student(self, student):
        self._students.remove(student)

    def get_students(self):
        return self._students.copy()  # Return copy
```

**Ruby:**
```ruby
# Before
class Course
  attr_accessor :students # Exposed collection
end

# After
class Course
  def initialize
    @students = []
  end

  def add_student(student)
    @students << student
  end

  def remove_student(student)
    @students.delete(student)
  end

  def students
    @students.dup # Return copy
  end
end
```

---

### Replace Type Code with Polymorphism

Replace type codes with subclasses.

**Python:**
```python
# Before
class Employee:
    ENGINEER = 0
    MANAGER = 1

    def __init__(self, employee_type):
        self.type = employee_type

    def pay(self):
        if self.type == self.ENGINEER:
            return 5000
        elif self.type == self.MANAGER:
            return 7000

# After
class Employee:
    def pay(self):
        raise NotImplementedError

class Engineer(Employee):
    def pay(self):
        return 5000

class Manager(Employee):
    def pay(self):
        return 7000
```

**Ruby:**
```ruby
# Before
class Employee
  ENGINEER = 0
  MANAGER = 1

  def initialize(type)
    @type = type
  end

  def pay
    case @type
    when ENGINEER then 5000
    when MANAGER then 7000
    end
  end
end

# After
class Employee
  def pay
    raise NotImplementedError
  end
end

class Engineer < Employee
  def pay
    5000
  end
end

class Manager < Employee
  def pay
    7000
  end
end
```

---

## Simplifying Conditional Expressions

### Decompose Conditional

Extract complex conditional logic into methods.

**Python:**
```python
# Before
if date.before(SUMMER_START) or date.after(SUMMER_END):
    charge = quantity * winter_rate + winter_service_charge
else:
    charge = quantity * summer_rate

# After
if is_winter(date):
    charge = winter_charge(quantity)
else:
    charge = summer_charge(quantity)

def is_winter(date):
    return date.before(SUMMER_START) or date.after(SUMMER_END)

def winter_charge(quantity):
    return quantity * winter_rate + winter_service_charge

def summer_charge(quantity):
    return quantity * summer_rate
```

**Ruby:**
```ruby
# Before
if date.before(SUMMER_START) || date.after(SUMMER_END)
  charge = quantity * winter_rate + winter_service_charge
else
  charge = quantity * summer_rate
end

# After
charge = if winter?(date)
           winter_charge(quantity)
         else
           summer_charge(quantity)
         end

def winter?(date)
  date.before(SUMMER_START) || date.after(SUMMER_END)
end

def winter_charge(quantity)
  quantity * winter_rate + winter_service_charge
end

def summer_charge(quantity)
  quantity * summer_rate
end
```

---

### Consolidate Conditional Expression

Combine conditionals that result in the same action.

**Python:**
```python
# Before
def disability_amount(employee):
    if employee.seniority < 2:
        return 0
    if employee.months_disabled > 12:
        return 0
    if employee.is_part_time:
        return 0
    # Calculate disability amount

# After
def disability_amount(employee):
    if is_not_eligible(employee):
        return 0
    # Calculate disability amount

def is_not_eligible(employee):
    return (employee.seniority < 2 or
            employee.months_disabled > 12 or
            employee.is_part_time)
```

**Ruby:**
```ruby
# Before
def disability_amount
  return 0 if seniority < 2
  return 0 if months_disabled > 12
  return 0 if part_time?
  # Calculate disability amount
end

# After
def disability_amount
  return 0 unless eligible?
  # Calculate disability amount
end

def eligible?
  seniority >= 2 && months_disabled <= 12 && !part_time?
end
```

---

### Replace Nested Conditional with Guard Clauses

Replace nested ifs with guard clauses.

**Python:**
```python
# Before
def pay_amount(employee):
    result = 0
    if employee.is_separated:
        result = separated_amount()
    else:
        if employee.is_retired:
            result = retired_amount()
        else:
            result = normal_pay_amount()
    return result

# After
def pay_amount(employee):
    if employee.is_separated:
        return separated_amount()
    if employee.is_retired:
        return retired_amount()
    return normal_pay_amount()
```

**Ruby:**
```ruby
# Before
def pay_amount
  result = 0
  if separated?
    result = separated_amount
  else
    if retired?
      result = retired_amount
    else
      result = normal_pay_amount
    end
  end
  result
end

# After
def pay_amount
  return separated_amount if separated?
  return retired_amount if retired?
  normal_pay_amount
end
```

---

### Replace Conditional with Polymorphism

Move conditional logic to subclasses.

**Python:**
```python
# Before
class Bird:
    def get_speed(self):
        if self.type == "EUROPEAN":
            return self.base_speed
        elif self.type == "AFRICAN":
            return self.base_speed - self.load_factor * self.coconuts
        elif self.type == "NORWEGIAN_BLUE":
            return 0 if self.is_nailed else self.base_speed

# After
class Bird:
    def get_speed(self):
        raise NotImplementedError

class European(Bird):
    def get_speed(self):
        return self.base_speed

class African(Bird):
    def get_speed(self):
        return self.base_speed - self.load_factor * self.coconuts

class NorwegianBlue(Bird):
    def get_speed(self):
        return 0 if self.is_nailed else self.base_speed
```

**Ruby:**
```ruby
# Before
class Bird
  def speed
    case @type
    when "EUROPEAN" then base_speed
    when "AFRICAN" then base_speed - load_factor * coconuts
    when "NORWEGIAN_BLUE" then nailed? ? 0 : base_speed
    end
  end
end

# After
class Bird
  def speed
    raise NotImplementedError
  end
end

class European < Bird
  def speed
    base_speed
  end
end

class African < Bird
  def speed
    base_speed - load_factor * coconuts
  end
end

class NorwegianBlue < Bird
  def speed
    nailed? ? 0 : base_speed
  end
end
```

---

### Introduce Null Object

Replace null checks with a Null Object.

**Python:**
```python
# Before
if customer is None:
    plan = BillingPlan.basic()
else:
    plan = customer.get_plan()

# After
class NullCustomer:
    def get_plan(self):
        return BillingPlan.basic()

    def is_null(self):
        return True

class Customer:
    def is_null(self):
        return False

# Usage
plan = customer.get_plan()  # Works for both Customer and NullCustomer
```

**Ruby:**
```ruby
# Before
if customer.nil?
  plan = BillingPlan.basic
else
  plan = customer.plan
end

# After
class NullCustomer
  def plan
    BillingPlan.basic
  end

  def null?
    true
  end
end

class Customer
  def null?
    false
  end
end

# Usage
plan = customer.plan # Works for both Customer and NullCustomer
```

---

## Making Method Calls Simpler

### Rename Method

Rename a method to reveal its intention.

**Python:**
```python
# Before
def get_num(self):
    return self._number

# After
def get_phone_number(self):
    return self._number
```

**Ruby:**
```ruby
# Before
def num
  @number
end

# After
def phone_number
  @number
end
```

---

### Introduce Parameter Object

Replace a group of parameters with an object.

**Python:**
```python
# Before
def amount_invoiced(start_date, end_date): ...
def amount_received(start_date, end_date): ...
def amount_overdue(start_date, end_date): ...

# After
from dataclasses import dataclass
from datetime import date

@dataclass
class DateRange:
    start: date
    end: date

def amount_invoiced(date_range): ...
def amount_received(date_range): ...
def amount_overdue(date_range): ...
```

**Ruby:**
```ruby
# Before
def amount_invoiced(start_date, end_date); end
def amount_received(start_date, end_date); end
def amount_overdue(start_date, end_date); end

# After
class DateRange < Struct.new(:start, :end); end

def amount_invoiced(date_range); end
def amount_received(date_range); end
def amount_overdue(date_range); end
```

---

### Preserve Whole Object

Pass the whole object instead of individual values.

**Python:**
```python
# Before
def within_range(low, high, value):
    return low <= value <= high

if within_range(room.temp_low, room.temp_high, temp):

# After
def within_range(room, temp):
    return room.temp_low <= temp <= room.temp_high

if within_range(room, temp):
```

**Ruby:**
```ruby
# Before
def within_range?(low, high, value)
  low <= value && value <= high
end

within_range?(room.temp_low, room.temp_high, temp)

# After
def within_range?(room, temp)
  room.temp_low <= temp && temp <= room.temp_high
end

within_range?(room, temp)
```

---

### Separate Query from Modifier

Split a method that returns a value and changes state.

**Python:**
```python
# Before
def get_and_reset_total(self):
    result = self.total
    self.total = 0
    return result

# After
def get_total(self):
    return self.total

def reset_total(self):
    self.total = 0
```

**Ruby:**
```ruby
# Before
def get_and_reset_total
  result = @total
  @total = 0
  result
end

# After
def total
  @total
end

def reset_total
  @total = 0
end
```

---

### Replace Constructor with Factory Method

Replace a constructor with a factory method.

**Python:**
```python
# Before
class Employee:
    def __init__(self, employee_type):
        self.type = employee_type

eng = Employee("ENGINEER")

# After
class Employee:
    @staticmethod
    def create_engineer():
        return Employee("ENGINEER")

    @staticmethod
    def create_manager():
        return Employee("MANAGER")

eng = Employee.create_engineer()
```

**Ruby:**
```ruby
# Before
class Employee
  def initialize(type)
    @type = type
  end
end

eng = Employee.new("ENGINEER")

# After
class Employee
  def initialize(type)
    @type = type
  end

  def self.create_engineer
    new("ENGINEER")
  end

  def self.create_manager
    new("MANAGER")
  end
end

eng = Employee.create_engineer
```

---

### Replace Error Code with Exception

Return an exception instead of an error code.

**Python:**
```python
# Before
def withdraw(amount):
    if amount > balance:
        return -1
    balance -= amount
    return 0

# After
class InsufficientFundsError(Exception):
    pass

def withdraw(amount):
    if amount > balance:
        raise InsufficientFundsError("Insufficient funds")
    balance -= amount
```

**Ruby:**
```ruby
# Before
def withdraw(amount)
  return -1 if amount > balance
  @balance -= amount
  0
end

# After
class InsufficientFundsError < StandardError; end

def withdraw(amount)
  raise InsufficientFundsError, "Insufficient funds" if amount > balance
  @balance -= amount
end
```

---

## Dealing with Generalization

### Pull Up Field

Move a field to a superclass.

**Python:**
```python
# Before
class Engineer:
    def __init__(self, name):
        self.name = name

class Manager:
    def __init__(self, name):
        self.name = name

# After
class Employee:
    def __init__(self, name):
        self.name = name

class Engineer(Employee):
    pass

class Manager(Employee):
    pass
```

**Ruby:**
```ruby
# Before
class Engineer
  attr_accessor :name
end

class Manager
  attr_accessor :name
end

# After
class Employee
  attr_accessor :name
end

class Engineer < Employee
end

class Manager < Employee
end
```

---

### Pull Up Method

Move a method to a superclass.

**Python:**
```python
# Before
class Engineer:
    def get_name(self):
        return self.name

class Manager:
    def get_name(self):
        return self.name

# After
class Employee:
    def get_name(self):
        return self.name

class Engineer(Employee):
    pass

class Manager(Employee):
    pass
```

**Ruby:**
```ruby
# Before
class Engineer
  def name
    @name
  end
end

class Manager
  def name
    @name
  end
end

# After
class Employee
  def name
    @name
  end
end

class Engineer < Employee
end

class Manager < Employee
end
```

---

### Extract Subclass

Create a subclass for a subset of features.

**Python:**
```python
# Before
class JobItem:
    def __init__(self, unit_price, quantity, is_labor=False):
        self.unit_price = unit_price
        self.quantity = quantity
        self.is_labor = is_labor

    def get_total_price(self):
        if self.is_labor:
            return self.quantity * LABOR_RATE
        return self.unit_price * self.quantity

# After
class JobItem:
    def __init__(self, quantity):
        self.quantity = quantity

    def get_total_price(self):
        raise NotImplementedError

class LaborItem(JobItem):
    def get_total_price(self):
        return self.quantity * LABOR_RATE

class PartsItem(JobItem):
    def __init__(self, unit_price, quantity):
        super().__init__(quantity)
        self.unit_price = unit_price

    def get_total_price(self):
        return self.unit_price * self.quantity
```

**Ruby:**
```ruby
# Before
class JobItem
  def initialize(unit_price, quantity, labor: false)
    @unit_price = unit_price
    @quantity = quantity
    @labor = labor
  end

  def total_price
    @labor ? @quantity * LABOR_RATE : @unit_price * @quantity
  end
end

# After
class JobItem
  def initialize(quantity)
    @quantity = quantity
  end

  def total_price
    raise NotImplementedError
  end
end

class LaborItem < JobItem
  def total_price
    @quantity * LABOR_RATE
  end
end

class PartsItem < JobItem
  def initialize(unit_price, quantity)
    super(quantity)
    @unit_price = unit_price
  end

  def total_price
    @unit_price * @quantity
  end
end
```

---

### Extract Superclass

Create a superclass from similar classes.

**Python:**
```python
# Before
class Engineer:
    def __init__(self, name, annual_salary):
        self.name = name
        self.annual_salary = annual_salary

class Manager:
    def __init__(self, name, annual_salary, bonus):
        self.name = name
        self.annual_salary = annual_salary
        self.bonus = bonus

# After
class Employee:
    def __init__(self, name, annual_salary):
        self.name = name
        self.annual_salary = annual_salary

class Engineer(Employee):
    pass

class Manager(Employee):
    def __init__(self, name, annual_salary, bonus):
        super().__init__(name, annual_salary)
        self.bonus = bonus
```

**Ruby:**
```ruby
# Before
class Engineer
  attr_accessor :name, :annual_salary
end

class Manager
  attr_accessor :name, :annual_salary, :bonus
end

# After
class Employee
  attr_accessor :name, :annual_salary
end

class Engineer < Employee
end

class Manager < Employee
  attr_accessor :bonus
end
```

---

### Form Template Method

Create a template method in a superclass with hooks for subclasses.

**Python:**
```python
# Before
class TextPrinter:
    def print(self, content):
        print(f"=== {content} ===")

class HtmlPrinter:
    def print(self, content):
        print(f"<h1>{content}</h1>")

# After
class Printer:
    def print(self, content):
        formatted = self.format_content(content)
        print(formatted)

    def format_content(self, content):
        raise NotImplementedError

class TextPrinter(Printer):
    def format_content(self, content):
        return f"=== {content} ==="

class HtmlPrinter(Printer):
    def format_content(self, content):
        return f"<h1>{content}</h1>"
```

**Ruby:**
```ruby
# Before
class TextPrinter
  def print(content)
    puts "=== #{content} ==="
  end
end

class HtmlPrinter
  def print(content)
    puts "<h1>#{content}</h1>"
  end
end

# After
class Printer
  def print(content)
    puts format_content(content)
  end

  def format_content(content)
    raise NotImplementedError
  end
end

class TextPrinter < Printer
  def format_content(content)
    "=== #{content} ==="
  end
end

class HtmlPrinter < Printer
  def format_content(content)
    "<h1>#{content}</h1>"
  end
end
```

---

### Replace Inheritance with Delegation

Replace inheritance with delegation when subclass doesn't need all of parent.

**Python:**
```python
# Before
class Stack(list):  # Inherits all list methods
    def push(self, item):
        self.append(item)

# Problem: stack.reverse() shouldn't exist

# After
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        return self._items.pop()

    def size(self):
        return len(self._items)

    # Only expose what Stack should have
```

**Ruby:**
```ruby
# Before
class Stack < Array # Inherits all Array methods
  def push(item)
    self << item
  end
end

# Problem: stack.reverse shouldn't exist

# After
class Stack
  def initialize
    @items = []
  end

  def push(item)
    @items << item
  end

  def pop
    @items.pop
  end

  def size
    @items.length
  end

  # Only expose what Stack should have
end
```
