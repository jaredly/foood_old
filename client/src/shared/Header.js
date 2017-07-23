import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';

const Header = ({data: {email, name}}) => {
  return <div>
    Hello {name} {email}
  </div>
}

export const headerQuery = gql`
query HeaderQuery {
  home {
    user {
      email
      name
    }
  }
}
`

export default graphql(homeQuery)(Header)
