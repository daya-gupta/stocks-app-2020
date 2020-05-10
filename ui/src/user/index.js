import React from 'react';
import { connect } from 'react-redux';
import { setError, registerUser, changeUser, getAllUsers } from '../common/actions/commonActions';

class User extends React.PureComponent {
    constructor (props) {
        super(props);
    }

    componentDidMount() {
        if (!this.props.users) {
            this.props.getAllUsers();
        }
    }

    registerUser = () => {
        const user = {
            fname: this.fnameInput.value,
            lname: this.lnameInput.value,
            username: this.usernameInput.value,
            password: this.passwordInput.value,
        }
        this.props.registerUser(user, () => {
            this.fnameInput.value = '';
            this.lnameInput.value = '';
            this.usernameInput.value = '';
            this.passwordInput.value = '';
        });
    }

    renderRegistrationForm = () => {
        return (
            <div>
                <div>
                    <label for="fname">First Name</label>
                    <input name="fname" ref={(item) => { this.fnameInput=item; }} />
                </div>
                <div>
                    <label for="lname">Last Name</label>
                    <input name="lname" ref={(item) => { this.lnameInput=item; }} />
                </div>
                <div>
                    <label for="username">User Name</label>
                    <input name="username" ref={(item) => { this.usernameInput=item; }} />
                </div>
                <div>
                    <label for="password">Password</label>
                    <input type="password" name="password" ref={(item) => { this.passwordInput=item; }} />
                </div>
                <button onClick={this.registerUser}>Register</button>
            </div>
        );
    }

    renderUsers = () => {
        const users = this.props.users;
        if (!users) return null;
        return users.map(item => {
            const style = {fontWeight: item.active ? 'bold' : 'normal'};
            return <div key={item._id} style={style} onClick={() => this.props.changeUser(item)}>{item.username}</div>
        })
    }

    render() {
        return (
            <div>
                <h1>User module</h1>
                {this.renderUsers()}
                {this.renderRegistrationForm()}
            </div>
        );
    }
}

const mapDispatchToProps = {
    registerUser,
    changeUser,
    getAllUsers
};

const mapStateToProps = (state) => {
    return {
        users: state.common.users
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(User);