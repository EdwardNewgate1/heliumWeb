import classNames from 'classnames'
import { upperFirst, debounce } from 'lodash'
import { useEffect, useRef, useState, memo, useCallback, useMemo } from 'react'
import { useActivity } from '../../../data/activity'
import ActivityList from '../../Lists/ActivityList/ActivityList'
import PillNavbar, { PillPane } from '../../Nav/PillNavbar'
import { Link } from 'react-router-i18n'
import { activityFiltersByContext } from '../../../utils/activity'
import TabNavbar, { TabPane } from '../../Nav/TabNavbar'

const defaultFilter = {
  hotspot: 'all',
  validator: 'all',
  account: 'all',
}

const ActivityPane = ({ context, address }) => {
  const scrollView = useRef()
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const [filter, setFilter] = useState(
    activityFiltersByContext[defaultFilter[context]],
  )

  const filters = activityFiltersByContext[context]

  const setVisibility = useCallback(
    () =>
      debounce(
        (currentPos, prevPos) => {
          setIsVisible(prevPos > currentPos)
          setPrevScrollPos(currentPos)
        },
        100,
        { leading: true, trailing: true },
      ),
    [],
  )

  const handleScroll = useCallback(
    ({ target: { scrollTop: currentScrollPos } }) => {
      setVisibility(currentScrollPos, prevScrollPos)
    },
    [prevScrollPos, setVisibility],
  )

  useEffect(() => {
    const currentScrollView = scrollView.current

    currentScrollView.addEventListener('scroll', handleScroll)

    return () => currentScrollView.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const [filtersLoading, setFiltersLoading] = useState(false)

  const currentFilters = useMemo(() => {
    return Object.entries(filters).map(([key, value]) => ({
      key,
      value: value.types,
      name: value.name,
    }))
  }, [filters, context])

  const handleUpdateFilter = useCallback((filterName) => {
    setFiltersLoading(true)
    setFilter(filterName)
    setFiltersLoading(false)

    console.log(filter)
    scrollView.current.scrollTo(0, 0)
  }, [])

  return (
    <div
      ref={scrollView}
      className={classNames('no-scrollbar overflow-y-scroll', {
        // 'overflow-y-scroll': !isLoadingInitial,
        // 'overflow-y-hidden': isLoadingInitial,
      })}
    >
      <div
        className={classNames(
          'sticky top-0 transform-gpu transition-transform duration-300 ease-in-out z-20',
          { '-translate-y-16': !isVisible },
        )}
      >
        <PillNavbar
          navItems={currentFilters}
          activeItem={filter}
          // disabled={isLoadingInitial || isLoadingMore}
          onClick={handleUpdateFilter}
        >
          {currentFilters.map((filter) => {
            return (
              <PillPane title={filter.name} path={filter.key} key={filter.key}>
                <ActivityList
                  title={`${upperFirst(context)} Activity (${filter.name})`}
                  description={
                    <div className="flex flex-col space-y-2">
                      <div>
                        All transactions that this {context} has participated
                        in, filtered by the currently selected filter ({filter}
                        ).
                      </div>
                      <div>
                        If you want to create an export of this activity for
                        taxes or record-keeping purposes, you can use one of the
                        community-developed tools to do so. You can browse them
                        all{' '}
                        <Link
                          className="text-gray-800 font-bold hover:text-darkgray-800"
                          to="/tools"
                        >
                          here
                        </Link>
                        .
                      </div>
                    </div>
                  }
                  context={context}
                  address={address}
                  filter={filter}
                  isLoading={!filter}
                  filters={filters}
                  filtersLoading={filtersLoading}
                  // transactions={transactions}
                  // isLoadingMore={isLoadingMore}
                  // fetchMore={fetchMore}
                  // hasMore={hasMore}
                />
              </PillPane>
            )
          })}
        </PillNavbar>

        {/* <TabNavbar>
          <TabPane title="Statistics" key="statistics">
            <div>Hello</div>
          </TabPane>
          <TabPane title="Activity" key="all">
            <div>Loading</div>
          </TabPane>
        </TabNavbar> */}
      </div>
      {/* <div className="grid grid-flow-row grid-cols-1">
        {filter && (
          <ActivityList
            title={`${upperFirst(context)} Activity (${
              activityFiltersByContext[context][filter].name
            })`}
            description={
              <div className="flex flex-col space-y-2">
                <div>
                  All transactions that this {context} has participated in,
                  filtered by the currently selected filter ({filter}).
                </div>
                <div>
                  If you want to create an export of this activity for taxes or
                  record-keeping purposes, you can use one of the
                  community-developed tools to do so. You can browse them all{' '}
                  <Link
                    className="text-gray-800 font-bold hover:text-darkgray-800"
                    to="/tools"
                  >
                    here
                  </Link>
                  .
                </div>
              </div>
            }
            context={context}
            address={address}
            filter={filter}
            filters={filters}
            filtersLoading={filtersLoading}
            // transactions={transactions}
            // isLoading={isLoadingInitial}
            // isLoadingMore={isLoadingMore}
            // fetchMore={fetchMore}
            // hasMore={hasMore}
          />
        )}
      </div> */}
    </div>
  )
}

export default memo(ActivityPane)
