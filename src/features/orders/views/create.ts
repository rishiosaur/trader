export const createOfferView = ({
	'title': {
		'type': 'plain_text',
		'text': 'Create a Product'
	},

	'submit': {
		'type': 'plain_text',
		'text': 'Submit'
	},
	'blocks': [
		{
			'type': 'input',
			'block_id': 'title',
			'element': {
				'type': 'plain_text_input',
				'action_id': 'title',
				'placeholder': {
					'type': 'plain_text',
					'text': 'A couple words on what your product is'
				}
			},
			'label': {
				'type': 'plain_text',
				'text': 'Title'
			},
			'hint': {
				'type': 'plain_text',
				'text': 'This is what people first see and get attracted to—spice things up!'
			}
		},
		{
			'type': 'input',
			'block_id': 'description',
			'element': {
				'type': 'plain_text_input',
				'action_id': 'description',
				'multiline': true,
				'placeholder': {
					'type': 'plain_text',
					'text': 'Description of your product—what is it, why should people buy it, and how do they contact you if they want to know more?'
				}
			},
			'label': {
				'type': 'plain_text',
				'text': 'Description'
			},
			'hint': {
				'type': 'plain_text',
				'text': "If your title's piqued customers' interest, then they'll be reading this even more—make this section yours!"
			}
		},
		{
			'type': 'input',
			'block_id': 'price',
			'element': {
				'type': 'plain_text_input',
				'action_id': 'price'
			},
			'label': {
				'type': 'plain_text',
				'text': 'Price',
				'emoji': true
			},
			'hint': {
				'type': 'plain_text',
				'text': 'Greater than 1HN, will be converted to integer value.'
			}
		}
	],
	'type': 'modal',
	'callback_id': 'offer_create',
})
