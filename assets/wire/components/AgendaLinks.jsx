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
        window.open(getAgendaHref(this.props.item, '_blank'));
    }

    render() {
        const {agenda, agendaWireItems} = this.state;

        if (!agenda) {
            return null;
        }

        return (
            <InfoBox label={gettext('Agenda')}>
                {get(agenda, 'event', null) &&
                    <PreviewTagsBlock label={gettext('Related Event')}>
                        <AgendaEventInfo item={agenda} onClick={this.openAgenda}/>
                    </PreviewTagsBlock>}

                {get(agenda, 'coverages.length', 0) > 0 &&
                    <PreviewTagsBlock label={gettext('Related Coverage')}>
                        <div className='mt-3'>
                            <AgendaCoverages
                                item={agenda}
                                coverages={agenda.coverages}
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
    }),
    preview: PropTypes.bool,
    fetchWireItemsForAgenda: PropTypes.func,
};