from bson import ObjectId

PUBLIC_USER_ID = ObjectId('5e65964bf5db68883df561a0')
ADMIN_USER_ID = ObjectId('5e65964bf5db68883df561a1')
TEST_USER_ID = ObjectId('5e65964bf5db68883df561a2')

COMPANY_1 = ObjectId('5e65964bf5db68883df561b0')
COMPANY_2 = ObjectId('5e659f3ff5db68883df561b1')
COMPANY_3 = ObjectId('5e659f3ff5db68883df561b2')

USERS = [
    {'_id': ADMIN_USER_ID, 'company': COMPANY_1, 'user_type': 'administrator'},
    {'_id': PUBLIC_USER_ID, 'company': COMPANY_2},
    {'_id': TEST_USER_ID, 'company': COMPANY_3}
]

COMPANIES = [
    {'_id': COMPANY_1, 'name': 'Press co.', 'is_enabled': False, 'company_type': 'internal'},
    {'_id': COMPANY_2, 'name': 'Company co.', 'is_enabled': True, 'company_type': 'public', 'archive_access': False},
    {'_id': COMPANY_3, 'name': 'Foo bar co.', 'is_enabled': True, 'company_type': 'test', 'archive_access': True}
]

"""
Admin:
    - search.navigation_ids == []
    - search.navigation_ids = Products=(
        - is_enabled: True | False
        - companies: contains user | doesn't contain user or is_admin
        - navigations
        - product_type: wire | not wire
    )
"""

NAV_1 = ObjectId('5e65964bf5db68883df561c0')
NAV_2 = ObjectId('5e65964bf5db68883df561c1')
NAV_3 = ObjectId('5e65964bf5db68883df561c2')
NAV_4 = ObjectId('5e65964bf5db68883df561c3')
NAV_5 = ObjectId('5e65964bf5db68883df561c4')
NAV_6 = ObjectId('5e65964bf5db68883df561c5')

NAVIGATIONS = [
    {'_id': NAV_1, 'name': 'Sport1', 'product_type': 'wire', 'is_enabled': True},
    {'_id': NAV_2, 'name': 'Sport2', 'product_type': 'wire', 'is_enabled': True},
    {'_id': NAV_3, 'name': 'Sport3', 'product_type': 'wire', 'is_enabled': True},
    {'_id': NAV_4, 'name': 'Sport4', 'product_type': 'wire', 'is_enabled': True},
    {'_id': NAV_5, 'name': 'Sport5', 'product_type': 'wire', 'is_enabled': True},
    {'_id': NAV_6, 'name': 'Sport6', 'product_type': 'wire', 'is_enabled': True},
]

PROD_1 = ObjectId('5e65964bf5db68883df561d0')
PROD_2 = ObjectId('5e65964bf5db68883df561d1')
PROD_3 = ObjectId('5e65964bf5db68883df561d2')
PROD_4 = ObjectId('5e65964bf5db68883df561d3')
PROD_5 = ObjectId('5e65964bf5db68883df561d4')

PRODUCTS = [{
    '_id': PROD_1, 'name': 'Sport1', 'description': 'sport product 1',
    'is_enabled': True, 'product_type': 'wire',
    'navigations': [str(NAV_1), str(NAV_2)],
    'companies': [str(COMPANY_1), str(COMPANY_2)],
    'query': 'service.code:a'
}, {
    '_id': PROD_2, 'name': 'Sport2', 'description': 'sport product 2',
    'is_enabled': True, 'product_type': 'wire',
    'navigations': [str(NAV_3)],
    'companies': [str(COMPANY_2), str(COMPANY_3)],
    'query': 'service.code:b', 'sd_product_id': 'sd_product_1'
}, {
    '_id': PROD_3, 'name': 'Sport3', 'description': 'sport product 3',
    'is_enabled': False, 'product_type': 'wire',
    'navigations': [str(NAV_4)],
    'companies': [str(COMPANY_1)]
}, {
    '_id': PROD_4, 'name': 'Sport4', 'description': 'sport product 4',
    'is_enabled': True, 'product_type': 'agenda',
    'navigations': [str(NAV_5)],
    'companies': [str(COMPANY_1), str(COMPANY_2)]
}, {
    '_id': PROD_5, 'name': 'Sport4', 'description': 'sport product 4',
    'is_enabled': True, 'product_type': 'wire',
    'navigations': [str(NAV_6)],
    'companies': [str(COMPANY_1), str(COMPANY_3)]
}]

SECTION_FILTERS = [{
    '_id': ObjectId('5e65964bf5db68883df561e0'), 'is_enabled': True, 'name': 'test',
    'filter_type': 'wire', 'query': 'NOT genre.code:"AM Service"'
}, {
    '_id': ObjectId('5e65964bf5db68883df561e1'), 'is_enabled': True, 'name': 'test',
    'filter_type': 'agenda', 'query': 'NOT calendars.name:"Exclude Me"'
}]
