<div class="new-address">
	<div class="row fix">
		<span class="td">收件人</span> 
		<div class="tr">
			<input class="ipt ipt-name" type="text" required placeholder="请填写收件人姓名" <%if(data){%> value="<%=data.name%>" <%}%> />
		</div>
	</div>
	<div class="row fix">
		<span class="td">收件人地址</span>
		<div class="tr"> 
			<div class="selects"></div>

			<input class="ipt ipt-address" type="text" required placeholder="请填写详细地址"  <%if(data){%> value="<%=data.address%>" <%}%> />
		</div>
	</div>
	<div class="row fix">
		<span class="td">邮政编码</span> 
		<div class="tr">
			<input class="ipt ipt-code" type="text" placeholder="请填写邮政编码"  <%if(data){%> value="<%=data.zipcode%>" <%}%> />
		</div>
	</div>
	<div class="row fix">
		<span class="td">联系电话</span> 
		<div class="tr">
			<input class="ipt ipt-tel" type="text" required placeholder="请填写收件人联系电话"  <%if(data){%> value="<%=data.tel%>" <%}%> />
		</div>
	</div>

	<%if(data){%>
		<input type="hidden" value="<%=data.addressId%>" name="addressId" />
	<%}%>

	<div class="row row2">
		<a href="#" class="save" data-role="save">保存</a>
		<a href="#" class="cancel" data-role="close">取消操作</a>
	</div>


</div>	