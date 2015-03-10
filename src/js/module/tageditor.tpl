<%
var op = arguments[0].data;
var data = op.data || data;
if($.type(data)!='array'){
	data = [data];
}
for(var i = 0; i<data.length; i++){
	var item = data[i];
    var enable = op.enable || item.enable;
	var disable = op.disable || item.disable;
    var value = item.value || item || '';
%>
<span class="tag-box <%if(enable){%>tag-enable<%}%> <%if(disable){%>tag-disable<%}%>"><em><%=value%></em><a class="tag-del" href="#">x</a></span>
<%}%>