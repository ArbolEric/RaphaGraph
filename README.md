RaphaGraph
==========

High Variable Pie and Bar Charts for RaphaelJs

Currently three graphs that can be initialized:

    var N = new Nightengale(options); // Single Nightengale style pie chart
    var aN = new aNightengales(options); // Multiple Nightengale style pie chart
    var rd = new RussianDolls(options); // Single bar graph
	
Each Nightengale pie chart can express up to two dimensions: categories and variables. The aData option can be passed in array as:

    [[val11, val12, val13], [val21, val22, val23] , [val31, val32, val33]]
	
Additionally, if we wanted to render several Nightengale pie charts on the same paper, we could add a third dimension, with aData passed as such:

    [
		[[val11, val12, val13], [val21, val22, val23] , [val31, val32, val33]],
		[[val11, val12, val13], [val21, val22, val23] , [val31, val32, val33]],
		[[val11, val12, val13], [val21, val22, val23] , [val31, val32, val33]],
		[[val11, val12, val13], [val21, val22, val23] , [val31, val32, val33]]
	]

