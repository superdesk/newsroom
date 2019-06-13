import React from 'react';
import PropTypes from 'prop-types';
import server from 'server';
import {get} from 'lodash';
import {gettext} from 'utils';

import InfoBox from './InfoBox';
import AgendaListItemIcons from 'agenda/components/AgendaListItemIcons';

function getAgendaHref(item) {
    return get(item, 'agenda_href');
}

export default class AgendaLinks extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {agenda: null};
        this.fetchAgenda();
    }

    componentDidUpdate(prevProps) {
        if (getAgendaHref(prevProps.item) !== getAgendaHref(this.props.item)) {
            this.setState({agenda: null});
            this.fetchAgenda();
        }
    }

    fetchAgenda() {
        const url = getAgendaHref(this.props.item);

        if (url) {
            server.getJson(url).then((agenda) => {
                this.setState({agenda});
            });
        }
    }

    render() {
        const {agenda} = this.state;

        if (!agenda) {
            return null;
        }

        return (
            <InfoBox label={gettext('Agenda')}>
                <a className="wire-articles__versions"
                    target="_blank"
                    href={'/agenda?item=' + agenda._id} title={gettext('Open agenda item "{{ name }}"', {name: agenda.name})}>
                    <div className="wire-articles__versions__item d-flex flex-column align-items-start">
                        <strong className="wire-articles__item-headline">{agenda.name}</strong>
                        <AgendaListItemIcons item={agenda} hideCoverages={false} row={true} />
                    </div>
                </a>
            </InfoBox>
        );
    }
}

AgendaLinks.propTypes = {
    item: PropTypes.shape({
        agenda_href: PropTypes.string,
    }),
    preview: PropTypes.bool,
};