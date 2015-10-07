'use strict';

import React from 'react';
import {PieChart} from 'react-d3';
import SimpleLocalSearchStore from './store';
import SimpleLocalSearchActions from './actions';
import ApiConstants from '../utils/simple_flux_api/constants';

class SearchForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
  }

  render() {
    return (
      <form onSubmit={e => this._handleSubmit(e)}>
        <label>{this.props.label}</label>
        <input
          // type={this.props.type ? this.props.type : 'text'}
          type='text'
          onChange={e => this._handleChange(e.target.value)}
        />
        <button type='submit' className='button alt small fit'>Search</button>
      </form>
    );
  }

  _handleSubmit(event) {

    event.preventDefault();

    let value = this.state.value;
    let dataUrl = this.props.dataUrl;
    let lookup = this.props.lookup;

    if (value && value.length > 0) {
      SimpleLocalSearchActions.fetchData(dataUrl, lookup, value);
    }
  }

  _handleChange(value) {
    this.setState({value});
  }

}

class DsoTableRow extends React.Component {

  render () {

    let dso = this.props.dso;

    return (
      <tr>
        <td>{dso.name}</td>
        <td>{dso.plant_count}</td>
        <td>{dso.carrier_count}</td>
        <td>{dso.power_sum} kwh</td>
      </tr>
    );

  }

}

class DsoTable extends React.Component {

  render() {

    let rows = this.props.rows.map(r => <DsoTableRow key={r.name} dso={r} />);

    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Plants</th>
            <th>Carriers</th>
            <th>Installed energy</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );

  }

}


function getResultWrapperState() {
  return {
    data: SimpleLocalSearchStore.getData(),
    apiState: SimpleLocalSearchStore.getApiState(),
    showMore: false
  };
}

class SimpleLocalSearchResultWrapper extends React.Component {

  constructor(props) {
    super(props);
    this.state = getResultWrapperState();
  }

  componentDidMount() {
    SimpleLocalSearchStore.addChangeListener(this._onStateChange.bind(this));
  }

  componentWillUnmount() {
    SimpleLocalSearchStore.removeChangeListener(this._onStateChange);
  }

  _onStateChange() {
    this.setState(getResultWrapperState());
  }

  render() {

    return (
      <div>
        <div className='row'>
          <div className='6u'>
            <SearchForm
              dataUrl='/simple_local_search/'
              lookup='muni'
              label='Enter your city'
            />
          </div>
          <div className='6u'>
            <SearchForm
              dataUrl='/simple_local_search/'
              lookup='plz'
              type='number'
              label='...or your postcode'
            />
          </div>
        </div>

        {this._renderResult()}

      </div>
    );
  }

  _renderResult() {

    if (this.state.apiState === ApiConstants.SUCCESS) {

      let data = this.state.data;
      let lookup = data.lookup;
      let result = data.result;

      return (
        <div>
          <div className='row'>
            <div className='12u box'>

              <h2>Nearby {lookup}</h2>

              <p>There are <strong>{result.metrics.plant_count}</strong> plants in total,
                operated by <strong>{result.metrics.dso_count} different operators</strong>.</p>
              <p><strong>{result.metrics.power_sum} kwh</strong> of installed power is available.</p>

              <a
                href='#'
                className='button special small'
                onClick={this._toggleShowMore.bind(this)}>
                {this.state.showMore ? 'Show less data' : 'Show more data'}
              </a>

            </div>
          </div>

          {this._renderMoreResult()}

        </div>

      );

    }
  }

  _renderMoreResult() {

    if (this.state.showMore) {

      let result = this.state.data.result;

      return (
        <div>
          <div className='row box'>
            <div className='6u'>
              {this._renderPieChart(result.per_carrier, 'power_sum', 'Installed energy per carrier')}
            </div>
            <div className='6u'>
              {this._renderPieChart(result.per_dso, 'power_sum', 'Installed energy per operator')}
            </div>
          </div>
          <div className='row box'>
            <div className='12u'>
              <h3>Operators</h3>
              <DsoTable rows={result.dsos} />
            </div>
          </div>
        </div>
      );

    }
  }

  _renderPieChart(buckets, field, title) {
    return (
      <PieChart
        data={this._getChartData(buckets, field)}
        width={300}
        height={300}
        radius={100}
        innerRadius={20}
        sectorBorderColor="white"
        title={title}
      />
    );
  }

  _getChartData(buckets, field) {
    let chartData = [];
    buckets.map(b => chartData.push({label: b.key, value: b[field].value}));
    return chartData;
  }

  _toggleShowMore() {
    let showMore = this.state.showMore;
    this.setState({showMore: !showMore});
  }

}

export default SimpleLocalSearchResultWrapper;
