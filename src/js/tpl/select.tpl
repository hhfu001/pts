
<select name="<%=name%>">

<%data.forEach(function(item){%>

	<option value=<%=item[0]%> <%if(current && current == item[0]){%> selected<%}%> ><%=item[1]%></option>

<%})%>	

</select>