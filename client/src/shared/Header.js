import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';
import {Div} from 'glamorous'

const Header = ({data: {email, name}}) => {
  return <Div css={{
    '@media(max-width: 800px)': {

    }
  }}>
    Hello {name} {email}
  </Div>
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
