# Security Policy

## Supported Versions

We take security seriously and actively maintain the following versions of Vanduo Framework:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |

We recommend always using the latest stable version to benefit from the most recent security updates and improvements.

## Reporting a Vulnerability

We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report


**Please do not report security vulnerabilities through public GitHub issues.**

Currently, we do not have a dedicated security contact email.

Please report security vulnerabilities using GitHub's private vulnerability reporting feature:
1. Navigate to the repository's Security tab
2. Click "Report a vulnerability"
3. Fill out the vulnerability report form

### What to Include

To help us better understand and resolve the issue, please include as much of the following information as possible:

- **Type of issue** (e.g., XSS, CSRF, injection, etc.)
- **Full paths of source file(s)** related to the issue
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it
- **Your name/handle** for acknowledgment (optional)

### What to Expect

After submitting a vulnerability report, you can expect:

- **Initial Response**: Within 48 hours acknowledging receipt of your report
- **Status Update**: Within 5 business days with our evaluation and expected resolution timeline
- **Resolution**: We aim to patch critical vulnerabilities within 30 days
- **Disclosure**: Once the vulnerability is patched, we'll coordinate with you on public disclosure timing

## Security Best Practices

When using Vanduo Framework in your projects:

### For Developers

1. **Keep Updated**: Always use the latest stable version
2. **Content Security Policy**: Implement appropriate CSP headers when using Vanduo components
3. **Input Validation**: Sanitize user inputs before using with Vanduo's dynamic components
4. **Dependencies**: Regularly check for updates to any build tools or dependencies
5. **Custom Code**: Review custom JavaScript that interacts with Vanduo components for security issues

### Known Considerations

- **Dynamic Content**: When using components that render dynamic content (modals, tooltips, toast notifications), always sanitize HTML to prevent XSS attacks
- **Third-party Scripts**: Be cautious when combining Vanduo with third-party scripts
- **CDN Usage**: If using Vanduo from a CDN, ensure you're using Subresource Integrity (SRI) hashes

## Security Updates

Security updates will be released as patches and announced through:

- GitHub Security Advisories
- Release notes
- Project changelog

Subscribe to repository notifications to stay informed about security updates.

## Attribution

We believe in recognizing security researchers who help keep our project safe. With your permission, we'll acknowledge your contribution in:

- Security advisories
- Release notes
- A security acknowledgments section (if you prefer)

You may choose to remain anonymous if you wish.

## Scope

This security policy applies to:

- The core Vanduo Framework (CSS and JavaScript components)
- Official documentation and examples
- Build scripts and tooling included in the repository

This policy does not cover:

- Third-party implementations or forks
- Issues in dependencies (please report those to the respective projects)
- User-created themes or extensions

## Additional Resources

- [GitHub Security Guidelines](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

Thank you for helping keep Vanduo Framework and its users safe!
