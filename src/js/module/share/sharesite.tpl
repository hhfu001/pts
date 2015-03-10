<ul>
<%data.forEach(function(item){%>
	<li class="share_site share_<%=item.name%>" id="freq_share_<%=item.name%>"><a href="#" title="转到<%=item.label%>"><i class="icon"></i><%=item.label%></a></li>
<%});%>
</ul>