import React, {Fragment} from 'react';
import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';

const AsyncTypeahead = asyncContainer(Typeahead);

class TypeaheadComponent extends React.Component {
  state = {
    // allowNew: false,
    isLoading: false,
    // multiple: false,
    options: [],
  };

  selectCompany = (item) => {
    this.setState({ options:[] });
    this.props.selectCompany(item);
  }

  render() {
    return (
      <Fragment>
        <AsyncTypeahead
          id="stock-typeahead"
          isLoading={this.state.isLoading}
          labelKey="name"
          onSearch={this._handleSearch}
          options={this.state.options || []}
          placeholder="Search for a company..."
          onChange={(selected) => {
            if (selected.length) {
              this.props.selectCompany(selected[0]);
            }
          }}
        />
      </Fragment>
    );
  }

  _handleSearch = (query) => {
    this.setState({isLoading: true});
    this.props.searchCompany(query, (options) => {
      this.setState({
          isLoading: false,
          options,
      });
    });
  }
}

export default TypeaheadComponent;
