import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import server from 'server';
import {get} from 'lodash';
import {gettext} from 'utils';

import InfoBox from './InfoBox';
import PreviewTagsBlock from './PreviewTagsBlock';
import PreviewBox from 'ui/components/PreviewBox';
import AgendaCoverages from 'agenda/components/AgendaCoverages';
import AgendaEventInfo from 'agenda/components/AgendaEventInfo';

export default class AgendaLinks extends React.PureComponent {
    constructor(props) {
        super(props);

        this.openAgenda = this.openAgenda.bind(this);

        this.state = {
            agenda: null,
            agendaWireItems: []
        };
        this.fetchAgendaData();
    }

    componentDidUpdate(prevProps) {
        if (get(prevProps, 'item._id') !== get(this.props, 'item._id')) {
            this.setState({
                agenda: null,
                'agendaWireItems': [],
            });
            this.fetchAgendaData();
        }
    }

    fetchAgendaData() {
        if (get(this.props, 'item._id')) {
            server.getJson(`agenda/wire_items/${this.props.item._id}`).then((data) => {
                this.setState({
                    'agenda': get(data, 'agenda_item'),
                    'agendaWireItems': get(data, 'wire_items'),
                });
            })
                .catch(() => {
                    this.setState({
                        'agenda': null,
                        'agendaWireItems': [],
                    });
                });
        }
    }

    openAgenda() {
        if (get(this.state, 'agenda._id')) {
            window.open(`/agenda?item=${this.state.agenda._id}`, '_blank');
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
            <Fragment>
                <InfoBox label={gettext('Agenda')}>
                    {get(agenda, 'event', null) &&
                        <PreviewTagsBlock label={gettext('Related Event')}>
                            <AgendaEventInfo item={agenda} onClick={this.openAgenda}/>
                        </PreviewTagsBlock>}
                </InfoBox>

                {coverages.length > 0 && <PreviewBox labelClass={'wire-column__preview__tags__headline'}
                    label={gettext('Related Coverage')}>
                    <div className='mt-3'>
                        <AgendaCoverages
                            item={agenda}
                            coverages={coverages}
                            wireItems={agendaWireItems}
                            onClick={this.openAgenda}
                            hideViewContentItems={[get(this.props, 'item._id')]} />
                    </div>
                </PreviewBox>}
            </Fragment>
        );
    }
}

AgendaLinks.propTypes = {
    item: PropTypes.shape({
        agenda_id: PropTypes.string,
        _id: PropTypes.string,
        coverage_id: PropTypes.string,
    }),
    preview: PropTypes.bool,
};