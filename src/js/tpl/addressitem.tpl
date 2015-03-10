
<div class="row fix">
	<span class="td">收件人</span> 
	<div class="tr">
		<span class="txt" data-role="name"><%=receiver%></span>
	</div>
</div>
<div class="row fix">
	<span class="td">收件人地址</span>
	<div class="tr"> 
		<span class="selects txt" data-address='{"province": "<%=province%>", "city": "<%=city%>", "district": "<%=district%>"}'><%=tprovince%><%=tcity%><%=tdistrict%> 
		</span>
		<span class="txt" data-role="address"><%=address%></span>
	</div>
</div>
<div class="row fix">
	<span class="td">邮政编码</span> 
	<div class="tr">
		<span class="txt" data-role="code"><%=zipcode%></span>
	</div>
</div>
<div class="row fix">
	<span class="td">联系电话</span> 
	<div class="tr">
		<span class="txt" data-role="tel"><%=tel%></span>
	</div>
</div>
<div class="row2">
	<a href="#" data-id="<%=addressId%>" data-role="edit">编辑</a>
	<a href="#" data-id="<%=addressId%>" data-role="del">删除</a>
</div>