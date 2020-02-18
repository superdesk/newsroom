import React from 'react';
import PropTypes from 'prop-types';
import server from 'server';
import {get} from 'lodash';
import {gettext} from 'utils';

import InfoBox from './InfoBox';
import PreviewTagsBlock from './PreviewTagsBlock';
import AgendaCoverages from 'agenda/components/AgendaCoverages';
import AgendaEventInfo from 'agenda/components/AgendaEventInfo';

function getAgendaHref(item) {
    return get(item, 'agenda_href');
}

export default class AgendaLinks extends React.PureComponent {
    constructor(props) {
        super(props);

        this.openAgenda = this.openAgenda.bind(this);

        this.state = {
            agenda: null,
            agendaWireItems: []
        };
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
                this.fetchWireItemsForAgenda(agenda);
            });
        }
    }

    fetchWireItemsForAgenda(agenda) {
        this.props.fetchWireItemsForAgenda(agenda).then((items) =>
        // {this.setState({agendaWireItems: (items || []).filter((i) => (i._id !== get(this.props, 'item._id')))});
        {this.setState({agendaWireItems: items});

        });
    }

    openAgenda() {
        if (get(this.props, 'item.agenda_id')) {
            window.open(`/agenda?item=${this.props.item.agenda_id}`, '_blank');
        }
    }

    coveragesToDisplay() {
        if (!get(this.props, 'item.coverage_id') || !this.state.agenda) {
            return [];
        }

        return (get(this.state.agenda, 'coverages') || []).filter((c) => c.coverage_id !== this.props.item.coverage_id);
    }

    render() {
        const {agenda, agendaWireItems} = this.state;

        if (!agenda) {
            return null;
        }

        const coverages = this.coveragesToDisplay();

        if (coverages.length === 0 && !get(agenda, 'event')) {
            return null;
        }

        return (
            <InfoBox label={gettext('Agenda')}>
                {get(agenda, 'event', null) &&
                    <PreviewTagsBlock label={gettext('Related Event')}>
                        <AgendaEventInfo item={agenda} onClick={this.openAgenda}/>
                    </PreviewTagsBlock>}

                {coverages.length > 0 && <PreviewTagsBlock label={gettext('Related Coverage')}>
                    <div className='mt-3'>
                        <AgendaCoverages
                            item={agenda}
                            coverages={coverages}
                            wireItems={agendaWireItems}
                            onClick={this.openAgenda}
                            hideViewContentItems={[get(this.props, 'item._id')]} />
                    </div>
                </PreviewTagsBlock>}
            </InfoBox>
        );
    }
}

AgendaLinks.propTypes = {
    item: PropTypes.shape({
        agenda_href: PropTypes.string,
        agenda_id: PropTypes.string,
        coverage_id: PropTypes.string,
    }),
    preview: PropTypes.bool,
    fetchWireItemsForAgenda: PropTypes.func,
};