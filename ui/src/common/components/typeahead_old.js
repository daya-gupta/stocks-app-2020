import React, {Fragment} from 'react';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';

class Typeahead extends React.Component {
    state = {
      allowNew: false,
      isLoading: false,
      multiple: false,
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
            {...this.state}
            id="search-typeahead"
            labelKey="name"
            minLength={3}
            onSearch={this._handleSearch}
            placeholder="Search for a company..."
            onChange={this.props.selectCompany}
            // renderMenuItemChildren={(option, props) => {
            //     return (
            //         <GithubMenuItem key={option.id} user={option.name} />
            //     )
            // }}
            // renderMenuItemChildren={(options, props) => {
            //     return options.map((item) => {
            //         return <li key={item.id}>{item.name}</li>
            //     })
            //   }
            // }
          />
          <div className="search-result-container">
              <ul className="search-result">
                  {
                    this.state.options.map((item) => {
                        return <li className="search-result-option" key={item.id} onClick={() => this.selectCompany(item)}>{item.name}</li>
                    })
                  }
              </ul>
          </div>
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

  export default Typeahead;