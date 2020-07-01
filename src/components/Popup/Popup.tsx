import React, { useState } from 'react'
import { TopMenu } from './layout/TopMenu'
import { Banner } from '../common/layout/Banner'
import './Popup.scss'
import { SearchBar, OnSearchCallback } from '../common/input/SearchBar'
import { MenuItem } from '../common/layout/Menu'

const icons = {
  vault_locked: (
    <svg
      width='32'
      height='32'
      version='1.1'
      viewBox='0 0 8.4667 8.4667'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        className='cls-2'
        cx='4.2333'
        cy='4.2333'
        r='4.2333'
        fill='#fff'
        strokeWidth='.10282'
      />
      <circle
        className='cls-3'
        cx='4.2333'
        cy='4.2333'
        r='3.3073'
        fill='#c5283e'
        strokeWidth='.10046'
      />
      <path
        className='cls-2'
        d='m5.2789 3.4662-2.2413.32173-.21613.031581a.18554.18554 0 00-.17567.18949l.31877 2.2205a.18554.18554 0 00.22304.13422l2.4574-.35331a.18653.18653 0 00.17567-.19146l-.31976-2.2196a.18554.18554 0 00-.22205-.13323zm-.73525 1.8455-.6484.092769.083887-.42733a.26054.26054 0 01-.17468-.19738c-.020725-.14606.10757-.28522.2862-.31088.17863-.02566.34147.072044.36318.21811a.26054.26054 0 01-.11152.23982z'
        fill='#fff'
        strokeWidth='.09869'
      />
      <path
        className='cls-2'
        d='m2.9725 4.009c0-.02862-.4145-1.7143.86157-1.8978s1.3609 1.5791 1.3609 1.5791l-.44115.064149s.02862-1.2889-.85071-1.1626c-.87933.12632-.452 1.3501-.452 1.3501z'
        fill='#fff'
        strokeWidth='.09869'
      />
    </svg>
  ),
  vault_unlocked: (
    <svg
      width='32'
      height='32'
      version='1.1'
      viewBox='0 0 8.4667 8.4667'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        className='cls-2'
        cx='4.2333'
        cy='4.2333'
        r='4.2333'
        fill='#fff'
        strokeWidth='.10282'
      />
      <g>
        <circle
          className='cls-3'
          cx='4.2333'
          cy='4.2333'
          r='3.3073'
          fill='#03a388'
          strokeWidth='.10046'
        />
        <path
          className='cls-2'
          d='m5.2957 3.6655-2.2771.32688-.21959.032086a.18851.18851 0 00-.17848.19252l.32387 2.2561a.18851.18851 0 00.22661.13637l2.4967-.35896a.18951.18951 0 00.17848-.19452l-.32487-2.2551a.18851.18851 0 00-.22561-.13536zm-.74701 1.875-.65877.094253.085229-.43417a.26471.26471 0 01-.17748-.20054c-.021056-.1484.10929-.28978.29078-.31585s.34693.073197.36899.22159a.26471.26471 0 01-.1133.24365z'
          fill='#fff'
          strokeWidth='.10027'
        />
        <path
          d='m3.8892 1.853c-.071849-.00287-.1483.00107-.22933.01273-.79214.11395-.94057.79447-.93806 1.3156l-.00157.0002005c5.24e-5.013669.00113.025234.00137.03858.0002506.013067-.0006215.027325-.0002006.040147h.00176c.00322.10033.00989.19368.01978.2728l.46277-.059731c-.013584-.067651-.025231-.14486-.032313-.22619-.00359-.040268-.0062-.081408-.00685-.12318-.00532-.33737.10006-.70344.56362-.77004.47613-.068401.68842.27165.78453.60416.037546.13349.14174.74739.15256.8472l.43476-.05601c-.014493-.094696-.11504-.67127-.1555-.83035h.00176c-.00171-.00631-.0043-.013035-.00607-.019388-.0002507-.0009209-.0007314-.00382-.0009815-.0047h-.00039c-.12778-.45447-.41332-1.0164-1.0516-1.0419z'
          fill='#fff'
          strokeWidth='.10027'
        />
      </g>
    </svg>
  ),
  options: (
    <svg
      width='40'
      height='40'
      version='1.1'
      viewBox='0 0 10.583 10.583'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g transform='translate(0 -286.42)'>
        <path
          d='m4.8943 286.42c-.1781-.002-.29665.0502-.41163.34759-.18397.47571-.35953.99273-.75923 1.1583-.3997.16555-.88962-.0761-1.3561-.28242-.46649-.20633-.49962.0325-.80554.33846-.30592.3059-.54479.33905-.33845.80553.20634.46647.44797.95638.28243 1.3561-.16555.3997-.68256.57526-1.1583.75923-.47573.18397-.32473.37635-.32473.80896s-.15099.62498.32473.80895c.47573.18397.99274.35953 1.1583.75922.16555.3997-.076087.8896-.28243 1.3561-.20634.46648.032536.49961.33845.80553.30592.30591.33906.54478.80554.33845.46649-.20634.9564-.44797 1.3561-.28242.3997.16555.57526.68255.75923 1.1583.18397.47573.37635.32474.80897.32474s.625.15099.80897-.32474c.18397-.47571.35953-.99271.75923-1.1583.3997-.16555.88961.0761 1.3561.28242.46649.20633.49962-.0325.80554-.33845.30592-.30592.54479-.33905.33845-.80553-.20634-.46648-.44797-.95638-.28243-1.3561.16555-.39969.68256-.57525 1.1583-.75922.47573-.18397.32473-.37634.32473-.80895s.15099-.62499-.32473-.80896c-.47573-.18397-.99274-.35953-1.1583-.75923-.16555-.39969.076087-.8896.28243-1.3561.20634-.46648-.032536-.49963-.33845-.80553-.30592-.30592-.33906-.54479-.80554-.33846-.46649.20634-.9564.44797-1.3561.28242-.3997-.16553-.5758-.68255-.75981-1.1583-.18401-.47573-.37593-.32473-.8084-.32473-.16223 0-.29048-.0214-.39734-.0229zm.39734 2.8208a2.4711 2.4711 0 012.4709 2.4709 2.4711 2.4711 0 01-2.4709 2.4709 2.4711 2.4711 0 01-2.4709-2.4709 2.4711 2.4711 0 012.4709-2.4709z'
          fill='#fff'
        />
      </g>
    </svg>
  )
}

export interface PopupProps {
  numSessions: number
  searchResults: Results
  search: (needle: string) => void
  openOptions: () => void
}

export const Popup: React.FunctionComponent<PopupProps> = ({
  numSessions,
  searchResults,
  search,
  openOptions
}: PopupProps) => {
  const [needle, setNeedle] = useState<string>('')

  const numResults = [...searchResults.keys()].reduce(
    (acc: number, url: string) => acc + searchResults.get(url).length,
    0
  )
  const hasResults = numResults === 0
  const isOnline = numSessions !== 0

  const onSearch: OnSearchCallback = () => {
    search(needle)
  }

  const searchBar = (
    <SearchBar
      needle={needle}
      onNeedleChange={setNeedle}
      onSearch={onSearch}
      isLoading={false}
    />
  )

  const menuItems: MenuItem[] = [
    {
      title: isOnline ? 'Sesssions' : 'Login',
      icon: isOnline ? icons.vault_unlocked : icons.vault_locked,
      onClick: openOptions
    },
    { title: 'Options', icon: icons.options, onClick: openOptions }
  ]

  return (
    <section className='popup'>
      <Banner />
      <TopMenu
        searchBar={searchBar}
        menuItems={menuItems}
        initialShowMenu={!(isOnline && hasResults)}
      />
    </section>
  )
}
