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

def show_Disclaimer():
    """
    Displays the 112-style emergency disclaimer banner.
    Called on every page render via main() so it is always visible.
    Rendered as a Streamlit warning box (st.warning).
    st.warning(EMERGENCY_DISCLAIMER)
    """

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
    age, sex, weight, is_pregnant (yes/no, only shown if sex == female),
    medical_conditions (multi-select from a predifined list of medical conditions).

    Note: medical_conditions and is_pregnant are stored in the profile
    and passed to check_Patient_Risks() at analysis time - they are not
    re-entered on each analysis.
    """

def render_Analysis_Page():
    """
    The main analysis page.
    User selects one or more drugs and enters daily dose.
    Calls all four functions from analyzer.py and displays the results as
    colored warning cards:
        - INFO    → blue card
        - CAUTION → yellow card
        - DANGER / DO NOT USE → red card (most prominent, shown first)

    The result is also saved through the save_History() onto the database.
    Emergency disclaimer (show_Disclaimer) is always visible at the top.
    """

def render_History_Page():
    """
    Lists the user's past drug analyses retrieved from get_History().
    Each row can be clicked to re-display the original analysis result.
    """
    pass

def renderSettingsPage():
    """
    Allows the user to update their profile (update_User_Profile) including is_pregnant
    and medical_conditions fields,
    and to permanently delete their account (delete_User_Account).
    """
    pass

def main():
    """
    The central main function that orchestrates the Streamlit application.
    Initializes the database on startup and routes the user to the correct
    page depending on the session state (logged in or not).

    Routing logic:
        - If not authenticated  ->  render_Login_Page()
        - If first-time login   ->  render_Profile_Page()
        - Otherwise sidebar navigation ->  Analysis | History | Settings | Logout

    show_Disclaimer() is called on every render cycle so the emergency
    warning is always visible regardless of the active page.
    """
    database_mgr.initDB()
    show_Disclaimer()
    pass

if __name__ == "__main__":
    main()