Feature: News API Syndicate ATOM Search

    Background: Initial setup
        Given "companies"
        """
        [{"name": "Test Company", "is_enabled" : true}]
        """
        Given "news_api_tokens"
        """
        [{"company" : "#companies._id#", "enabled" : true}]
        """
        When we save API token

    Scenario: Test atom of syndicate request response restricted by product
        Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim", "headline": "headline 1",
         "firstpublished": "#DATE-1#", "versioncreated": "#DATE#"},
        {"body_html": "Once upon a time there was a aardvark that could not swim", "headline": "headline 2",
        "firstpublished": "#DATE-1#", "versioncreated": "#DATE#"}]
        """
        Given "products"
        """
        [{"name": "A fishy Product",
        "decsription": "a product for those interested in fish",
        "companies" : [
          "#companies._id#"
        ],
        "query": "fish",
        "product_type": "news_api"
        }]
        """
        When we get "syndicate?formatter=atom"
        Then we get OK response
        Then we "get" "<title><![CDATA[headline 1]]></title>" in syndicate xml response
        Then we "don't get" "<title><![CDATA[headline 2]]></title>" in syndicate xml response

    Scenario: test syndicate atom request search q
        Given "items"
        """
        [{"body_html": "<p>Once upon a time there was a monkey who could swim</p>", "headline": "headline 1",
        "byline": "S Smith", "pubstatus": "usable", "service" : [{"name" : "Australian General News", "code" : "a"}],
        "description_text": "summary",
        "associations" : {
            "featuremedia" : {
                "mimetype" : "image/jpeg",
                "description_text" : "Deputy Prime Minister Michael McCormack during Question Time",
                "version" : "1",
                "byline" : "Mick Tsikas/AAP PHOTOS",
                "body_text" : "QUESTION TIME ALT",
                "renditions" : {
                    "16-9" : {
                        "href" : "/assets/5fc5dce16369ab07be3325fa",
                        "height" : 720,
                        "width" : 1280,
                        "media" : "5fc5dce16369ab07be3325fa",
                        "poi" : {
                            "x" : 453,
                            "y" : 335
                        },
                        "mimetype" : "image/jpeg"
                    }
            }
        }},
         "firstpublished": "#DATE-1#", "versioncreated": "#DATE#"}]
        """
        When we get "syndicate?formatter=atom&q=monkey"
        Then we get OK response
        Then we "get" "<title><![CDATA[headline 1]]></title>" in syndicate xml response
        Then we "get" "<media:credit>Mick Tsikas/AAP PHOTOS</media:credit>" in syndicate xml response

    Scenario: test atom request with embedded image
        Given "products"
        """
        [{"name": "A fishy Product",
        "decsription": "a product for those interested in fish",
        "companies" : [
          "#companies._id#"
        ],
        "query": "fish",
        "product_type": "news_api"
        },
        {"name": "A pic product",
        "decsription": "pic product",
        "companies" : [
          "#companies._id#"
        ],
        "query": "",
        "sd_product_id": "1",
        "product_type": "news_api"
        }]
        """
        Given "items"
        """
        [{"body_html": "<p>Once upon a time there was a fish who could swim</p><!-- EMBED START Image {id: \"editor_19\"} --><figure><img src=\"somthing\" alt=\"alt text\" id=\"editor_19\"<figcaption>Some caption</figcaption></figure><!-- EMBED END Image {id: \"editor_19\"} -->",
        "headline": "headline 1",
        "byline": "S Smith", "pubstatus": "usable", "service" : [{"name" : "Australian General News", "code" : "a"}],
        "description_text": "summary",
        "associations" : {
            "editor_19" : {
                "mimetype" : "image/jpeg",
                "description_text" : "Deputy Prime Minister Michael McCormack during Question Time",
                "version" : "1",
                "byline" : "Mick Tsikas/AAP PHOTOS",
                "body_text" : "QUESTION TIME ALT",
                "products": [{"code": "1"}],
                "renditions" : {
                    "16-9" : {
                        "href" : "/assets/5fc5dce16369ab07be3325fa",
                        "height" : 720,
                        "width" : 1280,
                        "media" : "5fc5dce16369ab07be3325fa",
                        "poi" : {
                            "x" : 453,
                            "y" : 335
                        },
                        "mimetype" : "image/jpeg"
                    }
            }
        }},
         "firstpublished": "#DATE-1#", "versioncreated": "#DATE#"}]
        """
        When we get "syndicate?formatter=atom"
        Then we get OK response
        Then we "get" "<title><![CDATA[headline 1]]></title>" in syndicate xml response
        Then we "get" "5fc5dce16369ab07be3325fa" in atom xml response
        Then we "get" "src="http://" in atom xml response

    Scenario: Atom request response restricted by featured image product
        Given "items"
        """
        [{"body_html": "Once upon a time there was a fish who could swim", "headline": "headline 1",
         "firstpublished": "#DATE-1#", "versioncreated": "#DATE#",
         "associations": {"featuremedia": {"products": [{"code": "1234"}], "renditions": {"original": {}} }}},
        {"body_html": "Once upon a time there was a aardvark that could not swim", "headline": "headline 2",
        "firstpublished": "#DATE-1#", "versioncreated": "#DATE#",
         "associations": {"featuremedia": {"products": [{"code": "4321"}], "renditions": {"original": {}} }}}]
        """
        Given "products"
        """
        [{"name": "A fishy Product",
        "decsription": "a product for those interested in fish",
        "companies" : [
          "#companies._id#"
        ],
        "query": "Once upon a time",
        "product_type": "news_api"
        },
        {"name": "A fishy superdesk product",
        "description": "a superdesk product restricting images in the atom feed",
        "companies" : [
          "#companies._id#"
        ],
        "sd_product_id": "1234",
        "product_type": "news_api"
        }
        ]
        """
        When we get "syndicate?formatter=atom"
        Then we get OK response
        Then we "get" "<title><![CDATA[headline 1]]></title>" in syndicate xml response
        Then we "don't get" "<title><![CDATA[headline 2]]></title>" in syndicate xml response
