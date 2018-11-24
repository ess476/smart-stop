
var start = 0
var end = 0

var depth = 0;
var stopped = false;

function controlPressed()
{
	return new Promise((resolve, reject) => {
		$(".control").click(function(){

			stopped = false;

			if (this.id == 'run')
			{
				throw 'cleaning up';
			}

			resolve();
		});
	});
}

function depthdec()
{
	depth -= 1;
}

async function _check()
{
	if (stopped)
	{
		await controlPressed();

		return new Promise((resolve, reject) => {
			setTimeout(resolve, 0);
		});

	} else {

		if (depth < 200)
		{
			depth += 1;
			return;
		}

		depth = 0;
		return new Promise((resolve, reject) => {
			setTimeout(resolve, 0);
		});
	}
}



async function fapply(f, ...args) {
	await _check();
	return f(...args);
}

async function sum(x, acc) {
	await _check();
	if (x === 0) {
		return acc;
	} else {
		return fapply(sum, x-1, acc + x);
	}
}

function run()
{

	checkcall = esprima.parse('async function func() { await _check(); } ').body[0].body.body[0];
	parsed = esprima.parse($('#code').val(), {tolerant: true}, function (node, meta) {
		if (node.type == "FunctionDeclaration")
		{
			node.async = true;
			node.body.body.unshift(checkcall);
		} else if (node.type == "CallExpression")
		{
			call = jQuery.extend(true, {}, node);

			node.type = "AwaitExpression";
			node.argument = call;

			delete node["arguments"];
			delete node["callee"];
		} else if (node.type == "WhileStatement" || node.type == "DoWhileStatement")
		{
			node.body.body.unshift(checkcall);
		}
	});

	
	

	let code = escodegen.generate(parsed);

	code = "async function _stub() { " +  code + "} setTimeout(_stub, 0);";
	code = code.replace('await,', 'await');
	console.log(code);
	eval(code);
}


$(document).ready(function()
{

	$('#stop').click(function() {
		stopped = true;
		alert('stopped');
	})

	$('#run').click(async function()
	{
		try {
			run();
		} catch(e)
		{
			console.log(e);
		}
	});
});

