import * as React from 'react'
import { NavigationContainerRef } from '@react-navigation/native'

export { NavigationContainer } from '@react-navigation/native'

export function createNavRef () {
  return React.createRef<NavigationContainerRef>()
}

export const navigationRef = createNavRef()

export interface IRoute <TParams = any> {
  screen: string
  params?: IRoute<TParams> | TParams
}

function routeFromArray <TParams = any>(route: string[], params: TParams): IRoute<TParams> {
  if (route.length === 0) {
    throw new Error('Empty route array received')
  }
  const root: IRoute<TParams> = {
    screen: route.shift()
  }
  let current = root
  while (route.length > 0) {
    const next = {
      screen: route.shift()
    }
    current.params = next
    current = next
  }
  current.params = params
  return root
}

export interface INavigate <TParams = any> {
  /**
   * Navigate to route as described in the react-navigation documentation
   * 
   * @see https://reactnavigation.org/docs/navigating-without-navigation-prop
   */
  (route: string, params?: TParams): void

  /**
   * Navigate to deep route with a set of strings instead of a route
   */
  (routes: string[], params?: TParams): void

  /**
   * Deep route navigation with a single object, useful if you want to pass around routes, mostly an implementation detail
   */
  (route: IRoute<TParams>): void
}

/**
 * Navigation with support for deep links
 * 
 * This expands upon the documented use of `navigate` that adds support for deep routes with objects and
 * with an array of routes.
 * 
 * @see https://reactnavigation.org/docs/navigating-without-navigation-prop
 * @see https://reactnavigation.org/docs/nesting-navigators/#navigating-to-a-screen-in-a-nested-navigator
 */
export const navigate: INavigate = <TParams = any> (route: string | string[] | IRoute<TParams>, params?: any) => {
  if (Array.isArray(route)) {
    route = routeFromArray(route, params)
    return navigate(route.screen, route.params)
  }
  if (typeof route !== 'string') {
    return navigate(route.screen, route.params)
  }
  navigationRef.current?.navigate(route, params)
}
