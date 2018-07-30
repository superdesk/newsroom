
def get_contact_name(contact):
    pieces = [contact.get('honorific'), contact.get('first_name'), contact.get('last_name')]
    return ' '.join(filter(None, pieces))


def get_contact_email(contact):
    return ', '.join(filter(None, contact.get('contact_email', [])))
