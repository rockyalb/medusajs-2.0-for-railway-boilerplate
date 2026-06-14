# Brevo Templates

Use these files as the source HTML for Brevo templates.

Brevo variables use `params`, for example:

```text
{{ params.order_number }}
```

Order item loops use Brevo's template language:

```text
{% for item in params.items %}
  {{ item.title }}
{% endfor %}
```

## Transactional Templates

### Konfirmimi i Porosisë

File: `order-confirmation.html`

Subjekti:

```text
Porosia YCO #{{ params.order_number }} u konfirmua
```

Required params:

```json
{
  "order_number": "123",
  "order_date": "6/14/2026",
  "customer_email": "customer@example.com",
  "customer_first_name": "Jane",
  "customer_last_name": "Doe",
  "currency_code": "USD",
  "total": "79.90",
  "shipping_address_1": "123 Main St",
  "shipping_city": "Tirana",
  "shipping_province": "",
  "shipping_postal_code": "1001",
  "shipping_country_code": "AL",
  "items": [
    {
      "title": "Rose Face Oil",
      "product_title": "YCO Skin",
      "quantity": 1,
      "unit_price": "39.95"
    }
  ]
}
```

After creating and activating the template in Brevo, set:

```env
BREVO_ORDER_PLACED_TEMPLATE_ID=your_template_id
```

### Ftesë për Admin

File: `admin-invite.html`

Subjekti:

```text
Je ftuar në YCO Admin
```

Required params:

```json
{
  "invite_link": "https://your-backend.com/app/invite?token=abc123",
  "email": "admin@example.com"
}
```

After creating and activating the template in Brevo, set:

```env
BREVO_INVITE_USER_TEMPLATE_ID=your_template_id
```

## Template Shtesë

Skedarët `customer-onboarding.html` dhe `password-reset.html` janë gati për flukset e ardhshme të onboarding/auth, por backend-i nuk i dërgon ende. Përdor të njëjtin model: krijo template-in në Brevo, shto një env var për template ID, pastaj lidhe një subscriber ose auth flow në Medusa që të dërgojë `params` përkatëse.

Për email-et marketing, përdor Brevo Marketing Campaigns dhe mjetet e listave/unsubscribe, jo rrugën transactional që përdoret për porosi dhe ftesa.
