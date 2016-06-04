describe "Spy", ->
	fetchedBar = null
	foo = null
	bar = 123
	beforeEach ->
		foo = 
			setBar: (value) -> 
				bar = value
				'hi!'
			getBar: -> 
				bar

		spyOn foo, 'setBar'
			.and.callThrough()
		spyOn foo, 'getBar'
			.and.callThrough()

		foo.setBar 123
		foo.getBar()

	it "tracks that the spy was called", ->
		expect(foo.getBar).toHaveBeenCalled()
	it "should not affect other functions", ->
		expect(bar).toEqual(123)
	it "when called returns the requested value", ->
		expect(foo.setBar()).toEqual('hi!')