# Code Smells Reference

Comprehensive guide to detecting and addressing code smells.

## Quick Detection Guide

| Category | Smell | Threshold | Quick Fix |
|----------|-------|-----------|-----------|
| Bloaters | Long Method | >20 lines | Extract Method |
| Bloaters | Large Class | >10 methods | Extract Class |
| Bloaters | Long Parameter List | >3 params | Introduce Parameter Object |
| Bloaters | Data Clumps | 2+ same params | Extract Class |
| OO Abusers | Switch Statements | 3+ cases | Replace with Polymorphism |
| OO Abusers | Parallel Inheritance | Same hierarchies | Merge hierarchies |
| Couplers | Feature Envy | Uses other class | Move Method |
| Couplers | Inappropriate Intimacy | Accesses private | Move Method/Field |

## Bloater Smells

### Long Method

**Detection:** Method exceeds 20 lines or has multiple responsibilities.

**Python:**
```python
# Smell - Long method with multiple responsibilities
def process_order(order):
    # Validation (5 lines)
    if not order.items:
        raise ValueError("No items")
    if not order.customer:
        raise ValueError("No customer")

    # Calculation (10 lines)
    subtotal = 0
    for item in order.items:
        subtotal += item.price * item.quantity
    tax = subtotal * 0.1
    shipping = 10 if subtotal < 100 else 0

    # Persistence (5 lines)
    order.total = subtotal + tax + shipping
    db.save(order)
    return order
```

**Fix:** Extract Method
```python
def process_order(order):
    validate_order(order)
    total = calculate_total(order)
    return save_order(order, total)

def validate_order(order):
    if not order.items:
        raise ValueError("No items")
    if not order.customer:
        raise ValueError("No customer")

def calculate_total(order):
    subtotal = sum(item.price * item.quantity for item in order.items)
    tax = subtotal * 0.1
    shipping = 10 if subtotal < 100 else 0
    return subtotal + tax + shipping
```

**Ruby:**
```ruby
# Smell - Long method
def process_order(order)
  # Validation
  raise "No items" if order.items.empty?
  raise "No customer" if order.customer.nil?

  # Calculation
  subtotal = order.items.sum { |i| i.price * i.quantity }
  tax = subtotal * 0.1
  shipping = subtotal < 100 ? 10 : 0

  # Persistence
  order.total = subtotal + tax + shipping
  db.save(order)
  order
end
```

**Fix:**
```ruby
def process_order(order)
  validate_order(order)
  total = calculate_total(order)
  save_order(order, total)
end

private

def validate_order(order)
  raise "No items" if order.items.empty?
  raise "No customer" if order.customer.nil?
end

def calculate_total(order)
  subtotal = order.items.sum { |i| i.price * i.quantity }
  tax = subtotal * 0.1
  shipping = subtotal < 100 ? 10 : 0
  subtotal + tax + shipping
end
```

---

### Large Class

**Detection:** Class has >10 methods or handles multiple responsibilities.

**Python:**
```python
# Smell - Class doing too much
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    # Authentication (3 methods)
    def authenticate(self, password): ...
    def generate_token(self): ...
    def validate_session(self): ...

    # Profile (3 methods)
    def update_profile(self, data): ...
    def get_avatar(self): ...
    def set_preferences(self, prefs): ...

    # Notifications (3 methods)
    def send_email(self, subject, body): ...
    def send_sms(self, message): ...
    def notify(self, message): ...
```

**Fix:** Extract Class
```python
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
        self.auth = AuthService(self)
        self.profile = ProfileService(self)
        self.notifications = NotificationService(self)

class AuthService:
    def __init__(self, user):
        self.user = user

    def authenticate(self, password): ...
    def generate_token(self): ...
    def validate_session(self): ...
```

**Ruby:**
```ruby
# Smell - Class doing too much
class User
  # Authentication
  def authenticate(password); end
  def generate_token; end
  def validate_session; end

  # Profile
  def update_profile(data); end
  def avatar; end
  def set_preferences(prefs); end

  # Notifications
  def send_email(subject, body); end
  def send_sms(message); end
  def notify(message); end
end
```

**Fix:**
```ruby
class User
  attr_reader :auth, :profile, :notifications

  def initialize(name, email)
    @name = name
    @email = email
    @auth = AuthService.new(self)
    @profile = ProfileService.new(self)
    @notifications = NotificationService.new(self)
  end
end

class AuthService
  def initialize(user)
    @user = user
  end

  def authenticate(password); end
  def generate_token; end
  def validate_session; end
end
```

---

### Long Parameter List

**Detection:** Method has >3 parameters.

**Python:**
```python
# Smell - Too many parameters
def create_user(name, email, phone, street, city, state, zip_code, country):
    ...

# Fix - Introduce Parameter Object
@dataclass
class Address:
    street: str
    city: str
    state: str
    zip_code: str
    country: str

@dataclass
class UserData:
    name: str
    email: str
    phone: str
    address: Address

def create_user(data: UserData):
    ...
```

**Ruby:**
```ruby
# Smell - Too many parameters
def create_user(name, email, phone, street, city, state, zip_code, country)
  # ...
end

# Fix - Introduce Parameter Object
Address = Struct.new(:street, :city, :state, :zip_code, :country)
UserData = Struct.new(:name, :email, :phone, :address)

def create_user(data)
  # Access: data.name, data.address.city
end

# Or use keyword arguments
def create_user(name:, email:, phone:, address:)
  # ...
end
```

---

## Object-Orientation Abusers

### Switch Statements

**Detection:** Switch/case or if-else chains based on type.

**Python:**
```python
# Smell - Type-based switching
def calculate_pay(employee):
    if employee.type == "ENGINEER":
        return employee.monthly_salary
    elif employee.type == "SALESMAN":
        return employee.monthly_salary + employee.commission
    elif employee.type == "MANAGER":
        return employee.monthly_salary + employee.bonus
```

**Fix:** Replace Conditional with Polymorphism
```python
class Employee:
    def calculate_pay(self):
        raise NotImplementedError

class Engineer(Employee):
    def calculate_pay(self):
        return self.monthly_salary

class Salesman(Employee):
    def calculate_pay(self):
        return self.monthly_salary + self.commission

class Manager(Employee):
    def calculate_pay(self):
        return self.monthly_salary + self.bonus
```

**Ruby:**
```ruby
# Smell - Type-based switching
def calculate_pay(employee)
  case employee.type
  when "ENGINEER" then employee.monthly_salary
  when "SALESMAN" then employee.monthly_salary + employee.commission
  when "MANAGER" then employee.monthly_salary + employee.bonus
  end
end
```

**Fix:**
```ruby
class Employee
  def calculate_pay
    raise NotImplementedError
  end
end

class Engineer < Employee
  def calculate_pay
    monthly_salary
  end
end

class Salesman < Employee
  def calculate_pay
    monthly_salary + commission
  end
end
```

---

### Parallel Inheritance Hierarchies

**Detection:** Creating a new subclass requires creating another.

**Python:**
```python
# Smell - Parallel hierarchies
class Shape:
    pass

class Circle(Shape):
    pass

class Square(Shape):
    pass

# Parallel hierarchy for rendering
class ShapeRenderer:
    pass

class CircleRenderer(ShapeRenderer):
    pass

class SquareRenderer(ShapeRenderer):
    pass
```

**Fix:** Merge hierarchies using composition
```python
class Shape:
    def __init__(self, renderer):
        self.renderer = renderer

class Circle(Shape):
    def render(self):
        self.renderer.render_circle(self)

class Square(Shape):
    def render(self):
        self.renderer.render_square(self)

# Single renderer with methods for all shapes
class Renderer:
    def render_circle(self, circle): ...
    def render_square(self, square): ...
```

---

## Coupler Smells

### Feature Envy

**Detection:** Method uses another class more than its own.

**Python:**
```python
# Smell - Method obsessed with other class
class Order:
    def __init__(self, customer):
        self.customer = customer

    def get_customer_discount(self):
        return self.customer.membership_level * 0.1

# Fix - Move Method to the class it envies
class Customer:
    def get_discount(self):
        return self.membership_level * 0.1

class Order:
    def get_customer_discount(self):
        return self.customer.get_discount()
```

**Ruby:**
```ruby
# Smell - Method obsessed with other class
class Order
  def initialize(customer)
    @customer = customer
  end

  def customer_discount
    @customer.membership_level * 0.1
  end
end

# Fix - Move Method
class Customer
  def discount
    membership_level * 0.1
  end
end

class Order
  def customer_discount
    @customer.discount
  end
end
```

---

### Inappropriate Intimacy

**Detection:** Classes access each other's private parts.

**Python:**
```python
# Smell - Accessing private attributes
class Order:
    def __init__(self):
        self._items = []  # "private"

class OrderPrinter:
    def print_items(self, order):
        for item in order._items:  # Accessing private!
            print(item)

# Fix - Provide proper access
class Order:
    def __init__(self):
        self._items = []

    def get_items(self):
        return self._items.copy()

class OrderPrinter:
    def print_items(self, order):
        for item in order.get_items():
            print(item)
```

---

## Dispensables

### Dead Code

**Detection:** Code that is never executed.

```bash
# Python - Find unused code
pip install dead
dead src/

# Ruby - Find unused code
gem install dead_end
```

### Speculative Generality

**Detection:** Unused abstractions, parameters, or base classes.

**Python:**
```python
# Smell - Unused parameter
def calculate(a, b, unused_param):
    return a + b

# Fix - Remove unused parameter
def calculate(a, b):
    return a + b
```

**Ruby:**
```ruby
# Smell - Unused abstract base
class Animal
  def speak
    raise NotImplementedError
  end
end

# Only one subclass ever created
class Dog < Animal
  def speak
    "Woof"
  end
end

# Fix - Remove unnecessary abstraction
class Dog
  def speak
    "Woof"
  end
end
```
