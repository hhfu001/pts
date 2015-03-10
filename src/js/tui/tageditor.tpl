<%
var op = arguments[0];
var data = op.data || op;
if($.type(data)!='array'){
	data = [data];
}
for(var i = 0; i<data.length; i++){
	var item = data[i];
    var enable = op.enable || item.enable;
	var disable = op.disable || item.disable;
    var value = item.value || item || '';
    var name = item.name || op.name || '';
%>
<span class="tag_box <%if(enable){%>tag_enable<%}%> <%if(disable){%>tag_disable<%}%>">
	<em><%=value%></em>
	<i class="tag_r"></i>
	<a class="tag_del" href="#"></a>
	<input type="hidden" style="display:none;" value="<%=value%>" name="<%=name%>"/>
</span>
<%}%>