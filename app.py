"""
------
app.py
------

The central Streamlit application. Main hub that orchestrates the
user interface, the database, and the analyzer.
Run with:
    streamlit run app.py
"""

import streamlit as st
from models import Drug, Patient
from analyzer import (
    check_Dose_Safety,
    check_Pathway_Conflict,
    check_Food_Interactions,
    check_Patient_Risks,
)
import database_mgr

def render_Login_Page():
    """
    Displays the login / registration page.
    User can either create a new account (calling create_User_Account)
    or log in with existing credentials (calling login_User).
    """

def render_Profile_Page():
    """
    Shown after first-time registration.
    Asks the user to fill in their medical profile with consecutive inputs:
    age, sex, weight, medical_conditions (multi-select).
    """

def render_Analysis_Page():
    """
    The main analysis page.
    User selects one or more drugs and enters daily dose.
    Calls all four functions from analyzer.py and displays the results as
    colored warning cards (info / caution / danger).
    The result is also saved through the save_History() onto the database.
    """

def render_History_Page():
    """
    Lists the user's past drug analyses retrieved from get_History().
    Each row can be clicked to re-display the original analysis result.
    """
    pass

def renderSettingsPage():
    """
    Allows the user to update their profile (update_User_Profile)
    and to permanently delete their account (delete_User_Account).
    """
    pass

def main():
    """
    The central main function that orchestrates the Streamlit application.
    Initializes the database on startup and routes the user to the correct
    page depending on the session state (logged in or not).
    """
    database_mgr.initDB()
    # Routing logic:
    #   - If not authenticated      → renderLoginPage()
    #   - If first-time login       → renderProfilePage()
    #   - Otherwise sidebar navigation to  → Analysis | History | Settings | Logout
    pass

if __name__ == "__main__":
    main()