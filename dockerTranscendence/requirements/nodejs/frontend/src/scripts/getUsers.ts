import { ref, computed } from 'vue';
import axios from 'axios'; // Import Axios

const fetchedData = ref([]);

export async function fetchData() {
  try {
    const response = await axios.get('http://localhost:3000/users'); // Make the API call
    const data = response.data; // Extract the data from the response
    // console.log(response.data);
    fetchedData.value = data; // Update the fetchedData reference
    return fetchedData; // Return the fetched data
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

export const rawValue = computed(() => [...fetchedData.value]);
