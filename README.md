# mapper
COMP 426 Final Project - Mapper

API Interface - User Functionality
<p>&nbsp;</p>
<table>
<tbody>
<tr>
<td>
<p><strong>Method Name</strong></p>
</td>
<td>
<p><strong>HTTP Request Type</strong></p>
</td>
<td>
<p><strong>URL Extension</strong></p>
</td>
<td>
<p><strong>Request Body Variables</strong></p>
</td>
<td>
<p><strong>Functionality</strong></p>
</td>
<td>
<p><strong>Required Session Variables</strong></p>
</td>
<td>
<p><strong>Session Variables Changed</strong></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Login</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/login</span></p>
</td>
<td>
<p><span style="font-weight: 400;">user, password</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Logs the user in</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Sign Up</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/createlogin</span></p>
</td>
<td>
<p><span style="font-weight: 400;">user, password</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Creates new user, logs them in</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Logout</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Get</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/logout</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Logs user out, deletes all session variables</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username</span></p>
</td>
<td>
<p><span style="font-weight: 400;">All</span></p>
</td>
</tr>
</tbody>
</table>
