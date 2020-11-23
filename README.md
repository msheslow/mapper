# mapper
COMP 426 Final Project - Mapper
<p>&nbsp;</p>
API CRUD Summary
<table>
<tbody>
<tr>
<td>&nbsp;</td>
<td>
<p><span style="font-weight: 400;">Create</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Read</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Update</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Delete</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">User</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/createlogin</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/login, /logout</span></p>
</td>
<td>
<p><span style="font-weight: 400;">N/A</span></p>
</td>
<td>
<p><span style="font-weight: 400;">N/A</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Trip</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/starttrip</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/gettrip/:id, /tripid,&nbsp;</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/addstop, </span><span style="font-weight: 400;">/deletestop, /deleteallstops, /updateroute</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/deletetrip</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Destination Database</span></p>
</td>
<td>
<p><span style="font-weight: 400;">N/A</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/autofill, /stopsinstates</span></p>
</td>
<td>
<p><span style="font-weight: 400;">N/A</span></p>
</td>
<td>
<p><span style="font-weight: 400;">N/A</span></p>
</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
API Interface - User Functionality
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
<p></p><p>&nbsp;</p>
API Interface - Trip Functionality
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
<p><span style="font-weight: 400;">Find Trips</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Get</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/tripids</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Returns the tripIDs for all of the user&rsquo;s trips</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Create New Trip</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/starttrip</span></p>
</td>
<td>
<p><span style="font-weight: 400;">startLocation, destination</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Creates new trip</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username</span></p>
</td>
<td>
<p><span style="font-weight: 400;">tripID</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Delete Trip</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/deletetrip</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Deletes trip and all stops in trip</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username, tripID</span></p>
</td>
<td>
<p><span style="font-weight: 400;">tripID</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Update Start/End</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/updateroute</span></p>
</td>
<td>
<p><span style="font-weight: 400;">newStartLocation, newEndLocation</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Updates start/end</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username, tripID</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
</tr>
</tbody>
</table>
<p></p><p>&nbsp;</p>
API Interface - Stops Functionality
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
<p><span style="font-weight: 400;">All Stops in Trip</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Get</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/gettrip/:id</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Returns all stops, startLocation, and endLocation</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username</span></p>
</td>
<td>
<p><span style="font-weight: 400;">tripID</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Add Stop</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/addstop</span></p>
</td>
<td>
<p><span style="font-weight: 400;">stopID</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Adds stop to trip in session</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username, tripID</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Delete Stop</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/deletestop</span></p>
</td>
<td>
<p><span style="font-weight: 400;">stopID</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Deletes stop from trip in session</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username, tripID</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Delete All Stop</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/deleteallstops</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Deletes all stops from trip in session</span></p>
</td>
<td>
<p><span style="font-weight: 400;">username, tripID</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
</tr>
</tbody>
</table>
<p></p><p>&nbsp;</p>
API Interface - Database Functionality
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
<p><span style="font-weight: 400;">Get Autofill Suggestions</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/autofill</span></p>
</td>
<td>
<p><span style="font-weight: 400;">wordFrag</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Returns stops in database that match first letters</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
</tr>
<tr>
<td>
<p><span style="font-weight: 400;">Get Sites</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Post</span></p>
</td>
<td>
<p><span style="font-weight: 400;">/stopsinstates</span></p>
</td>
<td>
<p><span style="font-weight: 400;">states (array)</span></p>
</td>
<td>
<p><span style="font-weight: 400;">Returns 100 most popular sites in the states that you pass through</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
<td>
<p><span style="font-weight: 400;">None</span></p>
</td>
</tr>
</tbody>
</table>
