/* This file is part of Indico.
 * Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico; if not, see <http://www.gnu.org/licenses/>.
 */

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Placeholder} from 'semantic-ui-react';
import getRoomStatsDataURL from 'indico-url:rooms_new.room_stats';
import {Translate, Param, PluralTranslate, Singular, Plural} from 'indico/react/i18n';
import {indicoAxios, handleAxiosError} from 'indico/utils/axios';
import camelizeKeys from 'indico/utils/camelize';

import './RoomStats.module.scss';


export default class RoomStats extends React.PureComponent {
    static propTypes = {
        roomId: PropTypes.number.isRequired,
    };

    state = {
        loaded: false,
        data: {},
    };

    componentDidMount() {
        const {roomId} = this.props;
        this.fetchStatsData(roomId);
    }

    async fetchStatsData(roomId) {
        let response;
        try {
            response = await indicoAxios.get(getRoomStatsDataURL({room_id: roomId}));
        } catch (error) {
            handleAxiosError(error);
            return;
        }
        this.setState({
            loaded: true,
            data: camelizeKeys(response.data)
        });
    }

    renderPlaceholder() {
        return (
            <Grid columns={2} stackable>
                {_.range(0, 2).map((i) => (
                    <Grid.Column key={i}>
                        <Placeholder styleName="placeholder">
                            <Placeholder.Line length="long" />
                            {_.range(0, 3).map((j) => (
                                <Placeholder.Paragraph key={j}>
                                    <Placeholder.Line length="medium" />
                                    <Placeholder.Line length="very short" />
                                </Placeholder.Paragraph>
                            ))}
                        </Placeholder>
                    </Grid.Column>
                ))}
            </Grid>
        );
    }

    render() {
        const {loaded, data} = this.state;
        const mapping = {
            times_booked: Translate.string('Times booked'),
            occupancy: Translate.string('Occupancy'),
        };
        if (!loaded) {
            return this.renderPlaceholder();
        }
        return (
            <div styleName="room-stats">
                {Object.entries(data).map(([key, {id, values, note}]) => (
                    <div key={key} styleName="stats-box">
                        <div styleName="title">{mapping[id]}{!!note && '*'}</div>
                        {values.map(({days, value}) => (
                            <div styleName="value-box" key={value}>
                                <div styleName="days">
                                    <PluralTranslate count={days}>
                                        <Singular>Last day</Singular>
                                        <Plural>Last <Param name="days" value={days} /> days</Plural>
                                    </PluralTranslate>
                                </div>
                                <div styleName="value">{Math.round(value)}{key === 'percentage' ? '%' : ''}</div>
                            </div>
                        ))}
                        {!!note && <div styleName="note">* <Param name="note" value={note} /></div>}
                    </div>
                ))}
            </div>
        );
    }
}
