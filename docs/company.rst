Companies
=========

Company types
-------------

You can configure multiple company types in ``settings.py``::

    COMPANY_TYPES = [
        dict(
            id='premium',
            name='Premium',
        ),
        dict(
            id='non-premium',
            name='Non-premium',
            wire_must={'range': {'urgency': {'gte': 3}}},
        ),
    ]

You can define ``wire_must`` filter or ``wire_must_not`` with elastic query.
By default there is no filtering for a company type.

These can be assigned to companies in Company management.