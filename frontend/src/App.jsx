// def main():
//     """
//     The central main function that orchestrates the Streamlit application.
//     Initializes the database on startup and routes the user to the correct
//     page depending on the session state (logged in or not).
//
//     Routing logic:
//         - If not authenticated  ->  render_Login_Page()
//         - Elif first-time login   ->  render_Profile_Page()
//         - Else (sidebar navigation) ->  Analysis | History | Settings | Logout
//
//     show_Disclaimer() is called on every render cycle so the emergency
//     warning is always visible regardless of the active page.
//     """
//     database_mgr.init_DB()
//     show_Disclaimer()
//     pass