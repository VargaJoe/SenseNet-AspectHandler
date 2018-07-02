// using $skin/scripts/jquery/jquery.js
var SNExtension = {};
toastr = typeof(toastr) === "undefined" ? {} : toastr;

SNExtension.SetupAspects = (function ($) {
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\
    //variables
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\
    if (typeof (window.CurrentContextNodePath) === 'undefined') {
        console.log('Error: CurrentContextNodePath is not set.');
        return;
    }
    var baseAspectLocation = '/Root/System/Schema/Aspects/';
    var _baseTable = '<table id="SA-AspectList" class="SA-AspectList"><thead><th>Aspect ID</th><th>Aspect name</th><th>Action</th></thead><tbody id="SA-AspectListBody"></tbody></table>';
    var container = $("div#SA-SetupAspectContainer");
    var aspectListBody = $("tbody#SA-AspectListBody");
    var logDebugMessages = false;

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\
    //functions
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\

    var log = function (message) {
        if (logDebugMessages && typeof(message) !== 'undefined' && message.length > 0)
            console.log.apply(console, arguments);
    }

    var RunRequest = function(method, path, extraData, query, succ, err) {
        if (typeof (path) === 'undefined' || path.length == 0)
            path = baseAspectLocation;
        var ajaxURL = '/oData.svc' + path + ((typeof (query) === 'undefined' || query === null) ? "" : query);
        var ajaxData = JSON.stringify((typeof (extraData) === 'undefined' || extraData === null) ? "" : extraData);

        log('Ajax request: \n\turl: ', ajaxURL, '\n\tmethod: ', method, '\n\tData: ', ajaxData);

        $.ajax({
            url: ajaxURL,
            dataType: 'json',
            data: ajaxData,
            method: method,
            success: succ,
            error: err
        });
    };

    var AddContent = function(content) {
        container.append(content);
    };

    var ToggleUrlEnd = function (url) {
        var p = url.indexOf("')");
        var newval;
        if (p >= 0 && p == url.length - 2)
            newval = url.substr(0, p).replace("('", "/");
        else {
            var segs = url.split("/");
            if (segs.length == 0) return;
            if (segs[segs.length - 1].length == 0)
                segs.pop();
            if (segs.length == 0) return;
            var last = "('" + segs.pop() + "')";
            segs.push((segs.length > 0) ? segs.pop() + last : last);
            newval = segs.join("/");
        }
        return newval;
    };

    var UpdateAspectList = function (rowData) {
        container.empty();
        container.append(_baseTable);
        aspectListBody = $("tbody#SA-AspectListBody");
        for (var i = 0; i < rowData.length; i++) {
            aspectListBody.append(
                '<tr data-SA-AspectName="' + rowData[i].Name + '" class="SA-AspectRow">' +
                '<td>' + rowData[i].Id + '</td>' +
                '<td>' + rowData[i].DisplayName + '</td>' +
                '<td>' +
                    '<div><span class="SA-span-button-add" data-SA-AddAspect="' + rowData[i].Name + '">' + 'add' + '</span>' +
                    '<span class="SA-span-button-remove" data-SA-RemoveAspect="' + rowData[i].Name + '">' + 'remove' + '</span></div></td>' +
                '</tr>'
            );
        }
        //add click handlers
        $('td span[data-SA-AddAspect]').each(function () { $(this).click({ Name: $(this).attr('data-SA-AddAspect'), Mode: 'Add' }, AddRemoveAdpect); });
        $('td span[data-SA-RemoveAspect]').each(function () { $(this).click({ Name: $(this).attr('data-SA-RemoveAspect'), Mode: 'Remove' }, AddRemoveAdpect); });
    };

    var ToggleAddRemoveButtons = function(aspectName) {
        RunRequest('GET', ToggleUrlEnd(window.CurrentContextNodePath), null, '/GetAspects',
            (function () {
                return function (succ) {
                    var hasAspect = $.inArray(aspectName, succ) > -1;
                    $("span[data-SA-" + (hasAspect ? "Add" : "Remove") + "Aspect=" + aspectName + "]").hide();
                    $("span[data-SA-" + (!hasAspect ? "Add" : "Remove") + "Aspect=" + aspectName + "]").show();
                }
            }(jQuery)),
            null //don't care about errors yet.
        );
    }

    var ShowError = function(message) {
        log('Error: ', message);
        toastr.error(message);
        AddContent('<p>' + message + '</p>');
    };

    var AddRemoveAdpect = function (event) {
        var action = event.data.Mode;
        var aspectName = event.data.Name;
        var patchData = ("{aspects:['" + aspectName + "']}");
        log('Modding aspect:\n\tAction: ', action, '\n\tName: ', aspectName, '\n\tpatchData: ', patchData);
        RunRequest("POST", ToggleUrlEnd(window.CurrentContextNodePath), patchData, "/"+action+"Aspects", SuccesfullyUpdatedAspect, ErrorUpdatingAspect);

        //if (action === 'Add')
        //    ListAspectFields(aspectName, AspectFieldsLoaded, AspectFieldsLoadFailed);
        UpdateAddRemoveButtonsOnAspects();
    }

    var SuccesfullyLoadedAspects = function(data) {
        if (!data.d.results.length) {
            toastr.info("Successful request, but no data was retrieved");
            return;
        }
        UpdateAspectList(data.d.results);
    };

    var ErrorLoadingAspects = function(query) {
        ShowError('Query failed: ' + query);
    };

    var SuccesfullyUpdatedAspect = function() {
        toastr.success("Aspect state updated");
    };

    var ErrorUpdatingAspect = function(errormsg) {
        toastr.error("Error updating adding state");
        console.log(errormsg.responseText);
    }

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\
    //v1.0 ^^
    //v1.1 vv
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\
    var NameOfLastQueryedAspect = '';
    var ListAspectFields = function (aspectName, succ, err) {
        RunRequest('GET', baseAspectLocation + "('" + aspectName + "')/RetrieveFields", null, null, succ, err);
        NameOfLastQueryedAspect = aspectName;
    }
    var AspectFieldsLoaded = function(d) {
        if (!d.length) {
            log('AspectFieldsLoad: Successful request, but no data was retrieved');
            toastr.info("Successful request, but no data was retrieved");
            return;
        }

        log('d: ', d);

        var aspectRow = $("tr[data-SA-AspectName=" + NameOfLastQueryedAspect + "]");
        var fieldData = '<tr><td colspan=\"3\">';
        fieldData += '<div class="SA-AspectFieldsContainer">';
        fieldData += '<table>';
            for (var i = 0; i < d.length; i++) {
                fieldData += '<tr><td>';
                fieldData += 'FieldName: ' + ((typeof (d[i].Name) === 'undefined') ? 'N/A' : d[i].Name) + '<br/>';
                fieldData += 'FieldType: ' + ((typeof (d[i].Type) === 'undefined') ? 'N/A' : d[i].Type) + '<br/>';
                fieldData += 'FieldDisplayName: ' + ((typeof (d[i].DisplayName) === 'undefined') ? 'N/A' : d[i].DisplayName) + '<br/>';
                fieldData += 'FieldDescription: ' + ((typeof (d[i].Description) === 'undefined') ? 'N/A' : d[i].Description) + '<br/>';
                fieldData += 'FieldBind: ' + ((typeof (d[i].Bind) === 'undefined') ? 'N/A' : d[i].Bind) + '<br/>';
                fieldData += '</td></tr>';
            }
        fieldData += '</table>';
        fieldData += '</div>';
        fieldData += '</td></tr>';
        aspectRow.after(fieldData);
    };
    var AspectFieldsLoadFailed = function () { };

    var LoadAspectsOnContent = function() {
        RunRequest('GET', baseAspectLocation, null, '?$select=Id,DisplayName,Name&metadata=no', SuccesfullyLoadedAspects, ErrorLoadingAspects);
    }
    var UpdateAddRemoveButtonsOnAspects = function() {
        RunRequest('GET', baseAspectLocation, null, '?$select=Name&metadata=no',
            (function () {
                return function (succ) {
                    for (var i = 0; i < succ.d.results.length; i++)
                        ToggleAddRemoveButtons(succ.d.results[i].Name);
                }
            }(jQuery)),
            null //don't care about errors yet.
        );
    }
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\
    //v 1.1 ^^
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\


    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\
    //base load
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------\\
    LoadAspectsOnContent();
    UpdateAddRemoveButtonsOnAspects();
})(jQuery);