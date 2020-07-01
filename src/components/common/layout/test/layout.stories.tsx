import React, { useState } from 'react'
import { action } from '@storybook/addon-actions'
import { Button } from '../../input/Button'

import { Banner } from '../Banner'
import { Logo } from '../Logo'
import { ListView, ListItem } from '../ListView'
import { LoadingComponent } from '../LoadingComponent'
import { LoadingSpinner } from '../LoadingSpinner'
import { Message } from '../Message'
import { MenuIcon } from '../MenuIcon'
import { Menu, MenuItem } from '../Menu'

export default {
  title: 'Layout'
}

/// /////////////////////////////////////////////////////////
// Example data

const listViewItems: ListItem[] = [
  {
    key: 'item-logo',
    title: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '40px'
        }}
      >
        <Logo />
        <h3>Item</h3>
      </div>
    ),
    content: (
      <Message>
        Both title and content can contain any type of HTML content.
      </Message>
    )
  },
  {
    key: 'item-long',
    title: <h3>Item Long</h3>,
    content: (
      <>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
          pharetra tincidunt massa, quis porttitor sapien rhoncus vel.
          Vestibulum at rhoncus magna, et fringilla odio. Phasellus id maximus
          massa. Donec congue viverra accumsan. Aliquam iaculis mauris et leo
          rhoncus cursus. In ullamcorper purus eu risus luctus pellentesque. Ut
          libero felis, ullamcorper nec eleifend at, cursus nec dui. Fusce
          condimentum et libero vel commodo. Duis vehicula congue imperdiet.
          Duis facilisis tincidunt aliquet. Integer feugiat enim sed nunc porta
          volutpat. Nullam metus dolor, porttitor quis quam vitae, tempus
          suscipit dui. Etiam interdum interdum aliquet. Aenean in congue nunc.
          Nulla fringilla quam a arcu laoreet, non pharetra quam vehicula. Sed
          vel tincidunt eros, vel aliquam nisi.
        </p>
        <p>
          Suspendisse mattis mollis eros, nec mollis mi lobortis ut. Aenean eu
          venenatis odio. Nullam mollis orci varius arcu iaculis vehicula.
          Aenean eget eleifend elit. In volutpat augue eget augue consectetur
          cursus. Aliquam sagittis sed est non aliquet. Donec non egestas nunc.
          Ut turpis libero, egestas bibendum iaculis sed, maximus et tellus.
          Mauris rhoncus congue ipsum, vitae consequat libero fringilla quis. Ut
          vulputate suscipit dui, at mollis turpis condimentum eget. Ut lacus
          magna, accumsan eu suscipit volutpat, dignissim et tellus. Nullam
          faucibus elit arcu, nec dapibus augue tincidunt non. Interdum et
          malesuada fames ac ante ipsum primis in faucibus.
        </p>
        <p>
          Sed vel odio condimentum, suscipit erat a, viverra arcu. Suspendisse
          et lorem id sem sodales mattis. Quisque dictum id sem a sodales. Morbi
          posuere condimentum lectus ac commodo. Nullam imperdiet auctor diam,
          sit amet elementum elit. Suspendisse potenti. Proin venenatis quis sem
          eget rutrum. In posuere neque eu metus eleifend mollis.
        </p>
        <p>
          Pellentesque habitant morbi tristique senectus et netus et malesuada
          fames ac turpis egestas. Suspendisse finibus ornare urna. Sed pretium
          justo ut purus mollis posuere at ac enim. Sed vestibulum, magna nec
          lacinia cursus, massa tellus gravida sapien, id finibus sem odio
          pulvinar urna. Fusce tempor lacus augue, eu dapibus quam sollicitudin
          a. Aenean eget pharetra risus. Proin lacus turpis, pulvinar et dapibus
          non, blandit vitae tortor. Donec tincidunt viverra bibendum.
        </p>
        <p>
          Phasellus a aliquam magna, ac porta neque. Etiam augue ex, cursus
          vitae auctor iaculis, aliquet at risus. Etiam felis risus, feugiat
          vehicula fringilla in, fringilla et velit. Ut viverra nec diam sit
          amet iaculis. Donec maximus risus est, et lobortis metus scelerisque
          ut. Nullam consequat laoreet diam in luctus. Praesent vel congue
          purus. Sed sit amet facilisis massa. Ut scelerisque risus id elit
          scelerisque maximus. Morbi risus metus, pretium quis lorem vel,
          pharetra mollis ipsum.
        </p>
      </>
    )
  },
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({
    key: `item-${n}`,
    title: <h3>Item {n}</h3>,
    content: <p>Content {n}</p>
  }))
]

const menuItems: MenuItem[] = [
  {
    title: 'Item 1',
    icon: (
      <svg
        width='40'
        height='40'
        version='1.1'
        viewBox='0 0 10.583 10.583'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          transform='scale(.26458)'
          d='m5.2637 0c-2.9158 5.9212e-16-5.2637 2.288-5.2637 5.1309v28.738c5.9212e-16 2.8429 2.3479 5.1309 5.2637 5.1309h-.26367v1h3v-1h24v1h3v-1h-.26367c2.9158 0 5.2637-2.288 5.2637-5.1309v-28.738c0-2.8429-2.3479-5.1309-5.2637-5.1309h-29.473zm1.2812 1.6973h26.91c2.662 0 4.8047 2.0901 4.8047 4.6855v26.234c0 2.5955-2.1427 4.6855-4.8047 4.6855h-26.91c-2.662 0-4.8047-2.0901-4.8047-4.6855v-26.234c0-2.5955 2.1427-4.6855 4.8047-4.6855zm.83984 1.1074c-2.4963 0-4.5078 1.9607-4.5078 4.3945v24.602c0 2.4338 2.0116 4.3945 4.5078 4.3945h25.23c2.4963 0 4.5078-1.9607 4.5078-4.3945v-24.602c0-2.4338-2.0116-4.3945-4.5078-4.3945h-25.23zm20.492 11.256a5.9606 5.9606 0 01.125 0 5.9606 5.9606 0 015.959 5.959 5.9606 5.9606 0 01-5.959 5.959 5.9606 5.9606 0 01-5.9629-5.959 5.9606 5.9606 0 015.8379-5.959zm.125 1.4453a4.5134 4.5134 0 00-4.5137 4.5137 4.5134 4.5134 0 004.5137 4.5137 4.5134 4.5134 0 004.5117-4.5137 4.5134 4.5134 0 00-4.5117-4.5137zm-18.609.14844a4.3661 4.3661 0 012.2793.58398 4.3661 4.3661 0 012.0449 2.6992h3.0117c.39944 0 .7207.32127.7207.7207v.72266c0 .39944-.32126.7207-.7207.7207h-3.0117a4.3661 4.3661 0 01-.44727 1.1016 4.3661 4.3661 0 01-5.9648 1.5977 4.3661 4.3661 0 01-1.5977-5.9648 4.3661 4.3661 0 013.6855-2.1816zm18.609 1a3.3644 3.3644 0 013.3633 3.3652 3.3644 3.3644 0 01-3.3633 3.3652 3.3644 3.3644 0 01-3.3652-3.3652 3.3644 3.3644 0 013.3652-3.3652zm-18.57.58203a2.7845 2.7845 0 00-2.3555 1.3906 2.7845 2.7845 0 001.0195 3.8027 2.7845 2.7845 0 003.8027-1.0176 2.7845 2.7845 0 00-1.0176-3.8027 2.7845 2.7845 0 00-1.4492-.37305z'
        />
      </svg>
    ),
    onClick: action('Menu Item 1')
  }
]

/// /////////////////////////////////////////////////////////
// Components

const BannerComponent: React.FunctionComponent = () => (
  <article className='story-article'>
    <h2>Banner</h2>
    <p>
      The banner should be put at the top of a page and a custom height should
      be set to the .banner class or the banner will inherit the height of the
      logo within it. Alternatively the height of the logo can be set instead.
    </p>
    <Banner />
  </article>
)

const LogoComponent: React.FunctionComponent = () => (
  <article className='story-article'>
    <h2>Logo</h2>
    <p>
      The logo can be used as part of the banner or individually. To apply a
      custom size to the logo, set the attributes of the .logo class.
    </p>
    <Logo />
  </article>
)

const ListViewComponent: React.FunctionComponent = () => {
  return (
    <article className='story-article'>
      <h2>List View</h2>
      <p>
        The List View component provides a means of navigation between different
        pages within a list. The component will fill the available space and
        scroll if it overflows the parent container. To cause overflow, the
        parent container must have a static height.
      </p>
      <section
        style={{
          height: '256px'
        }}
      >
        <ListView items={listViewItems} />
      </section>
    </article>
  )
}

const LoadingComponentComponent: React.FunctionComponent = () => (
  <article className='story-article'>
    <h2>Loading Component</h2>
    <p>
      Can be rendered in place of another component while initilization logic is
      being performed. Will fill the available space and place a loading spinner
      in the middle. (border for illustration purposes)
    </p>
    <section
      style={{
        maxWidth: '256px',
        height: '256px',
        border: '1px solid black'
      }}
    >
      <LoadingComponent />
    </section>
  </article>
)

const LoadingSpinnerComponent: React.FunctionComponent = () => (
  <article className='story-article'>
    <h2>Loading Spinner</h2>
    <p>
      It is recommended to use the Loading Component instead, but the Loading
      Spinner can be used individually as well.
    </p>
    <LoadingSpinner />
  </article>
)

const MessageComponent: React.FunctionComponent = () => (
  <article className='story-article'>
    <h2>Message</h2>
    <p>
      The message component can be used to display information about events that
      occur such as completed actions or errors.
    </p>
    <Message type='info'>
      <p>
        <strong>Info: </strong>Info Message
      </p>
    </Message>
    <Message type='warning'>
      <p>
        <strong>Warning: </strong>Warning Message
      </p>
    </Message>
    <Message type='error'>
      <p>
        <strong>Error: </strong>Error Message
      </p>
    </Message>
    <Message>
      <h3>Logo Message</h3>
      <p>A message can contain any HTML content.</p>
      <Logo />
    </Message>
  </article>
)

const MenuIconComponent: React.FunctionComponent = () => {
  const [selected, setSelected] = useState<boolean>(false)

  const toggle = (): void => {
    setSelected(!selected)
  }

  return (
    <article className='story-article'>
      <h2>Menu Icon</h2>
      <p>
        Hamburger menu icon with animation on toggle. The example uses the
        Button component to house the menu icon but it can be contained by any
        button element. The following css classes can be extended to adjust the
        colors of the menu icon:
      </p>
      <ul style={{ listStyle: 'disc', marginLeft: '40px' }}>
        <li>
          <strong>Primary color: </strong>.menu-icon .menu-icon-bar
        </li>
        <li>
          <strong>Hover color: </strong>button:hover .menu-icon .menu-icon-bar
        </li>
        <li>
          <strong>Focus color: </strong>button:focus .menu-icon .menu-icon-bar
        </li>
      </ul>
      <h3>Not Selected</h3>
      <Button color='primary'>
        <MenuIcon selected={false} />
      </Button>
      <h3>Selected</h3>
      <Button color='primary'>
        <MenuIcon selected={true} />
      </Button>
      <h3>Toggle to see transition.</h3>
      <Button onClick={toggle} color='primary'>
        <MenuIcon selected={selected} />
      </Button>
    </article>
  )
}

const MenuComponent: React.FunctionComponent = () => {
  const [showMenu, setShowMenu] = useState<boolean>(false)

  const toggle = (): void => {
    action('toggle')()
    setShowMenu(showingMenu => !showingMenu)
  }

  return (
    <article className='story-article'>
      <h2>Menu</h2>
      <p>Overlay menu which can be toggled.</p>
      <Button onClick={toggle}>Toggle Menu</Button>
      <Menu items={menuItems} show={showMenu} onClick={toggle} />
    </article>
  )
}

export const Layout: React.FunctionComponent = () => {
  return (
    <section className='story-section'>
      <article className='story-article'>
        <h1>Layout</h1>
        <p>
          Here are examples of components that can be used anywhere in the
          application and to add to the appearance of the application.
        </p>
      </article>
      <BannerComponent />
      <LogoComponent />
      <ListViewComponent />
      <LoadingComponentComponent />
      <LoadingSpinnerComponent />
      <MessageComponent />
      <MenuIconComponent />
      <MenuComponent />
    </section>
  )
}
