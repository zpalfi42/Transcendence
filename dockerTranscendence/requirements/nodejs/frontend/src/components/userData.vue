<template>
	<div v-if="user">
		<div v-if="user.logged === 1">
			<p>ID: {{ user.id }}
				Name: {{ user.names }}
				Type: {{ user.type }}
				Friends: {{ user.friends.join(', ') }} <!-- Display friends as a comma-separated list -->
				Logged: {{ user.logged === 1 }} <!-- Convert to boolean value -->
				Won: {{ user.won }}</p> <!-- Convert to boolean value -->
		</div>
		<div v-else>
			<!-- <h3>No LOGGED IN! </h3> -->
		</div>
	</div>
	<div v-else>
		<!-- <h3>Backend is not Running</h3> -->
	</div>
</template>

<script lang="ts">

import { defineComponent, ref, onMounted } from 'vue';
import { rawValue, fetchData } from '../scripts/getUsers.ts'

const user = ref(null);
const users = ref([]);

export default defineComponent({
	props: {
		who: {
			type: String,
			required: true,
		},
	},
	setup(props, { emit }) {

		onMounted(async () => {

			try {
				const fetchedData = await fetchData();
				users.value = rawValue.value;
				// console.log('Fetched Data:', fetchedData);
				// console.log(users.value.length);
				// console.log("im whoooo--->", props.who); // Access the prop value using props.who
				users.value.forEach((user) => {
					console.log("from userData", user.names);
					emit("signal");
				});

				user.value = users.value.find((user) => user.names === props.who);

				// provide('users', users); // Provide users ref to other components
			} catch (error) {
				console.error('Error fetching user data: Fake or Real Backend is not running!', error);
			}


		});



		return {
			user,

		};
	},
});










</script>
<style scoped></style>
