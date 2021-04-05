import { gql, GraphQLClient } from 'graphql-request'
import { hn_api, hn_token, market_api, market_token } from '../config'

export const Market = new GraphQLClient(market_api, {
	headers: {
		token: market_token,
	},
})

export const HN = new GraphQLClient(hn_api, {
	headers: {
		token: hn_token,
	},
})

export const createMarketUser = (id: string) =>
	Market.request(
		gql`
			mutation CreateUser($id: ID!) {
				createUser(id: $id) {
					id
				}
			}
		`,
		{
			id,
		}
	)

export const createHNUser = (id: string) =>
	HN.request(
		gql`
			mutation CreateUser($id: ID!) {
				createUser(id: $id) {
					id
				}
			}
		`,
		{ id }
	)

interface CreateOrderInput {
	title: string
	description: string
	cost: number
	seller: string
	tz: string
}

export const createOrder = (data: {
	seller: string
	cost: number
	description: any
	title: any
}) =>
	Market.request(
		gql`
			mutation CreateOrder(
				$title: String!
				$description: String!
				$cost: Float!
				$seller: String!
			) {
				createOrder(
					object: {
						title: $title
						description: $description
						cost: $cost
						seller: $seller
					}
				) {
					id
				}
			}
		`,
		{ ...data }
	)

export const addRequest = (data: { order: string; user: string; tz: string }) =>
	Market.request(
		gql`
			mutation AddRequest($order: ID!, $user: ID!, $tz: String!) {
				requestPurchase(order: $order, user: $user, tz: $tz) {
					seller {
						id
						ratings {
							type
						}
						buyingRating
						sellingRating
					}
				}
			}
		`,
		data
	)

interface UpdateOrderInput {
	title: string
	description: string
}

export const updateOrder = (id: string, data: UpdateOrderInput) =>
	Market.request(gql`
		mutation UpdateOrder($id: ID!, $title: String!, $description: String!) {
			updateOrder(
				order: $id
				object: { title: $title, description: $description }
			) {
				id
			}
		}
	`)
