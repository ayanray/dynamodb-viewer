var dynamodb = null;
var table = null;

$(document).ready(function() {
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
			var columnsStr = '<tr>';
			var objId = 0;
			data.Items.forEach(function(el) {
				var obj = {};
				for (const i in el) {
					var cellData = prettyPrint(el[i]);
					obj[i] = cellData;
					if (objId === 0) {
						columns.push({ field: i, title: i });
					}
				}
				objId++;
				objs.push(obj);
			});
		}
		columns = _.sortBy(columns, function(o) { return o.title; });
		console.log(columns);

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
				return JSON.stringify(data);
			}
			return data[i];
		}
	}
	return JSON.stringify(data);
}