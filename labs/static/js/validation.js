/* Лабораторная 2: клиентская валидация форм (DOM, функции JavaScript) */

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('register-form');
  if (!form) return;

  var fields = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    phone: document.getElementById('phone'),
    age: document.getElementById('age'),
    email: document.getElementById('email'),
    password: document.getElementById('password')
  };

  var submitBtn = form.querySelector('button[type="submit"]');

  function validateName(value, fieldName) {
    if (!value) return fieldName + ' обязательно';
    if (!/^[A-ZА-ЯЁ][a-zа-яё]+$/.test(value)) {
      return fieldName + ': только буквы, одна заглавная в начале';
    }
    return '';
  }

  function validatePhone(value) {
    if (!value) return 'Телефон обязателен';
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)) {
      return 'Формат: +7 (999) 123-45-67';
    }
    return '';
  }

  function validateAge(value) {
    var age = parseInt(value, 10);
    if (isNaN(age)) return 'Возраст обязателен';
    if (age < 14 || age > 120) return 'Возраст: от 14 до 120';
    return '';
  }

  function applyMaskPhone(input) {
    var digits = input.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    var formatted = '+7';
    if (digits.length > 1) formatted += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) formatted += ') ' + digits.slice(4, 7);
    if (digits.length >= 7) formatted += '-' + digits.slice(7, 9);
    if (digits.length >= 9) formatted += '-' + digits.slice(9, 11);
    input.value = formatted;
  }

  function showError(fieldId, message) {
    var el = document.getElementById(fieldId + '-error');
    if (el) el.textContent = message;
  }

  function validateField(name) {
    var field = fields[name];
    if (!field) return true;
    var value = field.value.trim();
    var error = '';

    switch (name) {
      case 'firstName':
        error = validateName(value, 'Имя');
        break;
      case 'lastName':
        error = validateName(value, 'Фамилия');
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'age':
        error = validateAge(value);
        break;
      case 'email':
        if (!value) error = 'Email обязателен';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Некорректный email';
        break;
      case 'password':
        if (!value) error = 'Пароль обязателен';
        else if (value.length < 6) error = 'Минимум 6 символов';
        break;
    }

    showError(name, error);
    return error === '';
  }

  function validateAll() {
    var names = Object.keys(fields);
    var allValid = names.every(validateField);
    if (submitBtn) submitBtn.disabled = !allValid;
    return allValid;
  }

  Object.keys(fields).forEach(function (name) {
    var field = fields[name];
    if (!field) return;

    field.addEventListener('input', function () {
      if (name === 'phone') applyMaskPhone(field);
      validateField(name);
      validateAll();
    });

    field.addEventListener('blur', function () {
      validateField(name);
      validateAll();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateAll()) return;

    var status = document.getElementById('form-status');
    if (status) {
      status.textContent = 'Форма прошла JS-валидацию! Данные: ' + JSON.stringify({
        firstName: fields.firstName.value,
        lastName: fields.lastName.value,
        phone: fields.phone.value,
        age: fields.age.value,
        email: fields.email.value
      });
      status.style.color = '#4bb34b';
    }
  });

  validateAll();
});
