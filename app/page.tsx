import { ToastrProvider } from "toastr-next/react";


export default function Home() {
	return (
		<>
			<ToastrProvider
				position='toast-top-right'
				options={{ progressBar: true, closeButton: true, animation: 'bounce', }}
			/>
		</>
	);
}
