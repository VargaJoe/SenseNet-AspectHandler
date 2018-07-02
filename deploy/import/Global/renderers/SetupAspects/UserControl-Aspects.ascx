<%@ Control Language="C#" AutoEventWireup="true" Inherits="System.Web.UI.UserControl" %>
<%@ Import Namespace="SenseNet.Portal.Virtualization" %>

<link href="//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css" rel="stylesheet" />
<script src="//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js"></script>

<style type="text/css">
	span.SA-span-button-add {
		background-color: lightgreen;
		border-radius: 4px;
		padding: 5px;
		color: white;
		cursor: default;
	}

	span.SA-span-button-remove {
		background-color: red;
		border-radius: 4px;
		padding: 5px;
		color: white;
		cursor: default;
	}

	table.SA-AspectList {
		border-collapse: collapse;
	}

		table.SA-AspectList td {
			padding-top: .5em;
			padding-bottom: .5em;
		}

	tr.SA-AspectRow {
	}

	div.SA-AspectFieldsContainer {
	}
</style>

<h1><%= PortalContext.Current.ContextNode.DisplayName  %></h1>
<%-- Container for the aspect table --%>
<div id="SA-SetupAspectContainer"></div>

<script type="text/javascript">
    $(function() {
        //configuration
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "1500",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
    });
    //required for the script below
    var CurrentContextNodePath = '<%=PortalContext.Current.ContextNode.Path%>';
</script>
<%-- Leave script import at the end of the renderer --%>
<script src="/Root/Global/scripts/snextension/SetupAspects.js"></script>