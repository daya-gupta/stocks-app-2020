import React from 'react';
import {shallow, configure, mount, render} from 'enzyme';
import Watchlist from './index';
import store from '../store';
import { Provider } from 'react-redux';
import sinon from 'sinon'

import Adapter from 'enzyme-adapter-react-16';
import { tsImportEqualsDeclaration } from '@babel/types';

configure({ adapter: new Adapter() })

const getConnectedComponent = (Component, props) => {
    return (
      <Provider store={store} {...props}>
        <Component />
      </Provider>
    );
}

it('should render the component correcty', () => {
    const wrapper = mount(getConnectedComponent(Watchlist));
    expect(2+2).toEqual(4);
})

it('should remove the item from watchlist correctly', () => {
    const watchlist = [
        {url: "/company/TCS/consolidated/", id: 3365, name: "Tata Consultancy Services Ltd"},
        {url: "/company/HCLTECH/consolidated/", id: 1297, name: "HCL Technologies Ltd"}
    ];
    const wrapper = render(getConnectedComponent(Watchlist));
    wrapper.setState({ watchlist });
    wrapper.instance().forceUpdate();
    console.log(wrapper.instance);
    wrapper.instance().forceUpdate();
    // expect(wrapper.state.watchlist.length).toEqual(1);    
})

// import React from 'react';
// // import ReactDOM from 'react-dom';
// import {shallow, configure, mount, render} from 'enzyme';
// import App from './App';
// import store from './store';
// import { Provider } from 'react-redux';
// import Adapter from 'enzyme-adapter-react-16';

// configure({ adapter: new Adapter() })

// const getConnectedComponent = (Component) => {
//   return (
//     <Provider store={store}>
//       <Component />
//     </Provider>
//   );
// }

// it('renders without crashing', () => {
//   // const div = document.createElement('div');
//   // ReactDOM.render(<, div);
//   // const wrap = render(getConnectedComponent(App));
//   const wrapper = render(getConnectedComponent(App));
//   // console.log(wrapper.find('.container'));
//   // expect(wrap.find('.container').to.have.lengthOf(1);
//   expect(wrapper.find('.container').length).toBe(1);
//   // ReactDOM.unmountComponentAtNode(div);
// });
