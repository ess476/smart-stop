
var start = 0
var end = 0

var depth = 0;
var stopped = false;

function resumePressed()
{
	return new Promise((resolve, reject) => {
		$("#resume").click(function(){
			stopped = false;
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
		await resumePressed();

		return new Promise((resolve, reject) => {
			setTimeout(resolve, 0);
		});

	} else {

		if (depth <= 8000)
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



async function fapply(f) {
	await check();
	return f.apply(null, arguments.slice(1))
}

async function sum(x, acc) {
	await check();
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
		run();
	});
});

