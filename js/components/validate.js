/**
 * Vanduo Framework - Validate (Form Validation) Component
 * Declarative validation via data attributes with real-time and on-submit modes
 */

(function () {
  'use strict';

  const Validate = {
    instances: new Map(),

    rules: {
      required: (value) => value.trim().length > 0,
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      url: (value) => { try { new URL(value); return true; } catch (_e) { return false; } },
      number: (value) => !isNaN(parseFloat(value)) && isFinite(value),
      min: (value, param) => value.length >= parseInt(param, 10),
      max: (value, param) => value.length <= parseInt(param, 10),
      minVal: (value, param) => parseFloat(value) >= parseFloat(param),
      maxVal: (value, param) => parseFloat(value) <= parseFloat(param),
      pattern: (value, param) => {
        try {
          // Cap regex length to prevent ReDoS from excessively complex patterns
          if (param.length > 100) return false;
          return new RegExp(param).test(value);
        } catch (_e) { return false; }
      },
      match: (value, param) => {
        try {
          const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(param) : param;
          const other = document.querySelector('[name="' + escaped + '"]');
          return other ? value === other.value : false;
        } catch (_e) {
          return false;
        }
      }
    },

    messages: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      url: 'Please enter a valid URL',
      number: 'Please enter a valid number',
      min: 'Minimum {0} characters required',
      max: 'Maximum {0} characters allowed',
      minVal: 'Value must be at least {0}',
      maxVal: 'Value must be at most {0}',
      pattern: 'Invalid format',
      match: 'Fields do not match'
    },

    init: function (root) {
      const forms = window.Vanduo.queryAll(root, '[data-vd-validate], .vd-validate');
      forms.forEach(form => {
        if (this.instances.has(form)) return;
        this.initInstance(form);
      });
    },

    initInstance: function (form) {
      const cleanup = [];
      const mode = form.getAttribute('data-vd-validate-mode') || 'blur'; // blur | input | submit
      const fields = form.querySelectorAll('[data-vd-rules]');

      const validateField = (field) => {
        const rulesStr = field.getAttribute('data-vd-rules') || '';
        const rules = rulesStr.split('|').map(r => r.trim()).filter(Boolean);
        const value = field.value;
        const errors = [];

        for (const rule of rules) {
          const [name, ...params] = rule.split(':');
          const param = params.join(':');
          const validator = this.rules[name];

          if (validator && !validator(value, param)) {
            const customMsg = field.getAttribute('data-vd-msg-' + name);
            let msg = customMsg || this.messages[name] || 'Invalid';
            if (param) msg = msg.replace('{0}', param);
            errors.push(msg);
            break; // one error at a time
          }
        }

        this.setFieldState(field, errors);
        return errors.length === 0;
      };

      const validateAll = () => {
        let valid = true;
        fields.forEach(field => {
          if (!validateField(field)) valid = false;
        });
        return valid;
      };

      // Per-field listeners
      fields.forEach(field => {
        if (mode === 'input' || mode === 'blur') {
          const eventType = mode === 'input' ? 'input' : 'blur';
          const handler = () => validateField(field);
          field.addEventListener(eventType, handler);
          cleanup.push(() => field.removeEventListener(eventType, handler));

          if (mode === 'blur') {
            const inputClear = () => {
              if (field.classList.contains('is-invalid') || field.classList.contains('is-valid')) {
                validateField(field);
              }
            };
            field.addEventListener('input', inputClear);
            cleanup.push(() => field.removeEventListener('input', inputClear));
          }
        }
      });

      // Form submit
      const submitHandler = (e) => {
        const valid = validateAll();
        if (!valid) {
          e.preventDefault();
          e.stopPropagation();
          // Focus first invalid field
          const firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid) firstInvalid.focus();
        }
        form.dispatchEvent(new CustomEvent('validate:submit', {
          detail: { valid },
          bubbles: true
        }));
      };

      form.addEventListener('submit', submitHandler);
      cleanup.push(() => form.removeEventListener('submit', submitHandler));

      this.instances.set(form, { cleanup, validateAll, validateField });
    },

    setFieldState: function (field, errors) {
      const wrapper = field.closest('.vd-form-group') || field.parentElement;
      let errorEl = wrapper.querySelector('.vd-validate-error');

      field.classList.remove('is-valid', 'is-invalid');

      if (errors.length > 0) {
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.className = 'vd-validate-error';
          errorEl.id = 'vd-err-' + Math.random().toString(36).slice(2, 9);
          errorEl.setAttribute('role', 'alert');
          wrapper.appendChild(errorEl);
        }
        errorEl.textContent = errors[0];
        errorEl.style.display = '';
        field.setAttribute('aria-describedby', errorEl.id);
      } else if (field.value.trim()) {
        field.classList.add('is-valid');
        field.removeAttribute('aria-invalid');
        if (errorEl) errorEl.style.display = 'none';
      } else {
        field.removeAttribute('aria-invalid');
        if (errorEl) errorEl.style.display = 'none';
      }
    },

    validateForm: function (form) {
      const instance = this.instances.get(form);
      return instance ? instance.validateAll() : false;
    },

    addRule: function (name, validator, message) {
      this.rules[name] = validator;
      if (message) this.messages[name] = message;
    },

    destroy: function (form) {
      const instance = this.instances.get(form);
      if (!instance) return;
      instance.cleanup.forEach(fn => fn());
      this.instances.delete(form);
    },

    destroyAll: function () {
      this.instances.forEach((_, form) => this.destroy(form));
    }
  };

  if (typeof window.Vanduo !== 'undefined') {
    window.Vanduo.register('validate', Validate);
  }

  window.VanduoValidate = Validate;

})();
