var dynamodb = null;
var table = null;

var settings = ['keyId', 'secret', 'endpoint', 'region'];
var dynamoDbRegions = [
	'us-east-1',
	'us-west-1',
	'us-west-2',
	'ap-south-1',
	'ap-northeast-1',
	'ap-northeast-2',
	'ap-southeast-1',
	'ap-southeast-2',
	'eu-central-1',
	'eu-west-1',
	'sa-east-1'
];

function populateAwsRegions() {
	dynamoDbRegions.forEach(function(val) {
		$('#region').append('<option>' + val + '</option>');
	});
}

function loadDefaultSettings() {
	settings.forEach(function(val) {
		if (localStorage[val]) {
			$('#' + val).val(localStorage[val]);
		}
	});
}

function saveSettings() {
	settings.forEach(function(val) {
		localStorage[val] = $('#' + val).val();
	});
}

$(document).ready(function() {
	populateAwsRegions();
	loadDefaultSettings();
	$('#connect').click(connect);
	$('#tableSelect').change(function() {
		populateData($('#tableSelect').val());
	});
});

function connect() {
	var keyId = $('#keyId').val();
	var secret = $('#secret').val();
	var endpoint = $('#endpoint').val();
	var region = $('#region').val();

	saveSettings();

	console.log('Connecting to ' + endpoint + ' in ' + region);
	dynamodb = new AWS.DynamoDB({
		endpoint: endpoint,
		region: region,
		accessKeyId: keyId,
		secretAccessKey: secret
	});

	dynamodb.listTables({}, function(err, data) {
		$('#tables').empty();
		$('#tableSelect').empty();
		data.TableNames.forEach(function(el) {
			$('#tables').append('<li class="list-group-item">' + el + '</li>');
			$('#tableSelect').append('<option>' + el + '</option>');
		});
		$('#sectionTables').show();
		$('#sectionData').show();
		if (data.TableNames.length > 0) {
			try {
				populateData(data.TableNames[0]);
			} catch (err) {
				console.log('Failed populating data because: ' + err);
			}
		}
	});
}

function populateData(tableName) {
	console.log('Fetching data from Table: ' + tableName);
	dynamodb.scan({ TableName: tableName }, function(err, data) {

		var objs = [];
		var columns = [];
		if (data.Items) {
			data.Items.forEach(function(el) {
				var obj = {};
				for (const i in el) {
					var cellData = prettyPrint(el[i]);
					obj[i] = cellData;
					columns.push({ field: i, title: i });
				}
				objs.push(obj);
			});
		}
		columns = _.sortBy(columns, function(o) { return o.title; });
		columns = _.uniqBy(columns, function (e) {
			return e.field;
		});

		$('#table').bootstrapTable('destroy');
		$('#table').bootstrapTable({
			columns: columns,
			data: objs,
			search: true,
			idField: 'id'
		});
	});
}

function prettyPrint(data) {
	if (Object.keys(data).length === 1) {
		for (var i in data) {
			if (i === 'M') {
				return syntaxHighlight(JSON.stringify(stripJargon(data), undefined, 4));
			}
			return data[i];
		}
	}
	return JSON.stringify(data);
}

function syntaxHighlight(json) {
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var cls = 'number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = 'key';
			} else {
				cls = 'string';
			}
		} else if (/true|false/.test(match)) {
			cls = 'boolean';
		} else if (/null/.test(match)) {
			cls = 'null';
		}
		return '<span class="' + cls + '">' + match + '</span>';
	});
}

function stripJargon(data) {
	for (var key in data) {
		if (key === 'M') {
			for (var subKey in data[key]) {
				data[subKey] = data[key][subKey];
			}
			delete data[key];
		} else if (key === 'S') {
			data = data[key];
		} else if (key === 'N') {
			data = data[key];
		}
	}

	// Flatten Object now
	for (var key in data) {
		if (data[key] instanceof Object) {
			for (var subKey in data[key]) {
				if (subKey === 'S' || subKey === 'N') {
					data[key] = data[key][subKey];
				} else if (subKey === 'M') {
					data[key] = stripJargon(data[key]);
				} else if (subKey === 'L') {
					data[key] = data[key][subKey];
					for (var i = 0; i < data[key].length; i++) {
						if (data[key][i] instanceof Object) {
							data[key][i] = stripJargon(data[key][i]);
						}
					}
				}
			}
		}
	}
	return data;
}