# Newsroom Changelog

## [1.15.1] 2019-09-10
### Features
- None

### Improvements
- None

### Fixes
- [SDAN-594] Previewing past or future Agenda item from email displays list not the preview (#848)
- Save Topic and Save Events 'SAVE' button was disabled while saving (#849)

## [1.15] 2019-09-09
### Features
- None

### Improvements
- [SDAN-578][SDAN-579] 'Account Manager' field in Company schema and use that in Company Expiry alerts (#832)
- [SDAN-570] Fixes/Improvements to the 'share' action (#838)
- [SDAN-591] Improve company expiry email layout and text (#841)
- [SDAN-570] Changes to 'share' item template (#842)
- [SDAN-572] Style changes to display 'Event Completed' label (#843)
- [SDAN-568] Improve responsive behaviour for mobile phones (#834)
- [SDAN-568] Further response layout improvements (#844)

### Fixes
- [SDAN-583] Preview for items that aren't wire or agenda in the Subscriber Activity report don't show the body text (#831)
- [SDAN-580] Remove company expiry check from user login and notifications (#833)
- [SDAN-587] Ignore agenda when applying time limit to search (#836)
- [SDAN-590] (fix): Celery beat and queue configs (#840)
- [SDAN-592] Coverages in the Agenda Share/Print Preview are misaligned (#845)
- [SDAN-593] Show all event coverages if no planning item selected (#847)

## [1.14] 2019-08-22
### Features
- [SDAN-538] Add the ability to execute the remove expired command (#817)

### Improvements
- [SDAN-572] Label completed agenda items as 'Completed' (#829)
- [SDAN-572][SDAN-567] UI changes in displaying 'byline', 'located' and 'slugline' (#823)
- [SDAN-565] Reposition the 'show map' text in Agenda Preview (#821)
- [SDAN-566] Add 'preview' and 'open' to 'actions' filter in subscriber activity report (#822)
- [SDAN-524][SDAN-530] Record 'open' and 'preview' actions in history collection (#815)
- [SDAN-519] Toggle map display in Agenda Preview (#811)

### Fixes
- [SDAN-585] (fix): Corrections showing up as 'Updates Coming' (#830)
- [SDAN-569] Market Place Bookmarks were not seen (#828)
- UI fix to add padding after 'published' and remove 'on created_time' in wire ite, detail (#826)
- fix creating new dashboard card when there is single dashboard type (#827)
- [SDAN-576] Prefer description_text over body_text for image captions (#825)
- [SDAN-575] Internal note on coverages is visible for public users in Newsroom (#824)
- [SDAN-548] ednote from wire item was not displayed in Agenda coverage. (#818)
- [SDAN-549] Text from wire items were not updating in Agenda preview (#818)
- [SDAN-531] Push errors when event is created from a planning item (#814)
- [SDAN-516] Show agency logos for AAPX (#816)
- [SDAN-535] Add 'located' attribute as 'Location' when a wire item is copied (#813)

## [1.13.1] 2019-07-18
- [SDAN-532] Fetch card external item details after loading the page (#812)

## [1.13] 2019-07-16
- [SDAN-529] Fix incorrect coverage scheduled date in Agenda notification email
- [SDAN-514] Changes to Watched Agenda Emails (#808)
- [SDAN-526] Draft coverage tooltip change and display all regions in filter if vocabulary is present (#807)
- [SDAN-527] null delivery sequence_no in coverage was causing push error
- [SDAN-512] Grey fill companies which are disabled in Company Management List
- [SDAN-525] Disable user text selection in item preview
- [SDAN-502] Bug fix when using locators vocabularies for Region filter in Agenda
- [SDAN-514] Notification Email restructure for watched Agenda items
- [SDAN-518] Coverage's ednote should be overwritten by news item's ednote
- [SDAN-502] Add 'locators' vocabulary and use it to group and detail regions dropdown in agenda
- [SDAN-511] Apply sorting to user management
- [SDAN-512] Grey fill rows of a disabled company in company reports
- [SDAN-513] In subscriber Activity report, remove the background fill from the list
- [SDAN-517] Displayed agenda_links should open Agenda in a new tab when opened in Wire
- [SDAN-501] Publish time in delivery record is not taking content item's publish schedule into account
- [SDAN-510] Event created from adhoc planning item was creating new event in Agenda
- [SDESK-506] Add mapping for graphic name
- [SDAN-497] Change label for archive acccess
- [SDAN-508] Pagination problems in subscriber activity report
- [SDAN-499] Add Headline to Planning not linked to an Event
- [SDAN-505] Alphabetically sort Users in User Management based on last_name
- [SDAN-500] 'Sections' filter for subscriber activity report

## [1.12] 2019-05-27
- fix(User Management) fix layout for company dropdown in user management
- [SDAN-481] Subscriber Activity Report
- [SDAN-496] Availability value for aapX content
- [STTNHUB-65] - Embargoed items should not appear in cards
- [SDAN-480, SDAN-483] Add last active time for user and filter user list by company Using MAIL_FROM for the from address
- [SDAN-498] Item URL in coverage requests form was not working when top-stories feature was turned on
- [SDAN-503] Remove user_ids from elastic query when getting list of item history on push
- [SDAN-504] Add timestamp and direction options to index_from_mongo


## [1.11] 2019-05-09
- [SDAN-493] Update planning tile and coverage icon when update is coming
- [SDAN-494] 'View Content' link was not available for completed media coverages
- Logout user if the company or user is disabled.
- [SDAN-492] Coverage with linked updates UI bugs
- [SDAN-491] Changes to labelling for the 'All Events & Coverages' Filter in Agenda.
- Added notes to preview panel
- Using agenda resource only for planning items
- [SDAN-403] Adding toggle filter for events only view.
- [SDAN-488] Add COVERAGE_REQUEST_RECIPIENTS to Newsroom general setting
- [SDAN-464] Extend the Coverage concept to include iterations/updates to the original text coverage item
- [SDAN-490] New agenda and story notifications were not working. And unpost was not removing item from list
- [SDAN-476] Adding Newsroom section for Media Release content.
- [SDAN-479] Minor changes to date shown in Agenda list view section headers
- [STTNHUB-58] - Display notes in details
- [SDAN-494] View Content was not visible for media coverages
- [SDAN-476] Adding Newsroom section for Media Release content.
