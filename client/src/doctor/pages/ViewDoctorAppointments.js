import React from "react";
import { useState } from "react";
import { useNavigate, Link , Link as RouterLink } from "react-router-dom";
import "@fontsource/inter";
import "react-dropdown/style.css";
import DatePickerMaterialUI from "../components/DatePickerMaterialUI";
import dayjs from "dayjs";
import Button from "@mui/joy/Button";
import { useFetchAppointmentsQuery, useFetchDoctorQuery } from "../../store";
import SearchBar from "../../patient/components/SearchBar";
import { isAfter, isSameDay, isBefore, set, parseISO } from "date-fns";
import { Autocomplete } from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import CircularProgress from "@mui/joy/CircularProgress";
import AppointmentCard from "../components/AppointmentCard";
import { Typography } from "@mui/joy";
import { DatePicker, Space } from "antd";
const { RangePicker } = DatePicker;

function ViewDoctorAppointments({ socket }) {
  const [selection, setSelection] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const { data, error, isFetching } = useFetchAppointmentsQuery();

  const navigate = useNavigate();

  let filteredAppointments = [];

  const options = ["upcoming", "cancelled", "completed", "rescheduled"];

  if (isFetching) filteredAppointments = [];
  else if (selection.length === 0) {
    filteredAppointments = data.filter((appointment) => appointment.patient != null);
  } else {
    filteredAppointments = data.filter((appointment) => selection.includes(appointment.status));
  }

  if (selectedDateRange) {
    filteredAppointments = filteredAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.formattedDate.split(",")[0]);
      const startDate = new Date(selectedDateRange[0]);
      const endDate = new Date(selectedDateRange[1]);

      const same = isSameDay(startDate, appointmentDate) || isSameDay(endDate, appointmentDate);
      const inRange = isAfter(appointmentDate, startDate) && isBefore(appointmentDate, endDate);

      return same || inRange;
    });
  }

  filteredAppointments = filteredAppointments.filter((appointment) => {
    const name = appointment.patient.name.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (selectedOptions) => {
    setSelection(selectedOptions);
  };

  const handleDateRange = (date) => {
    setSelectedDateRange(date);
  };

  let renderedAppointments = [];

  if (filteredAppointments) {
    renderedAppointments = filteredAppointments.map((appointment, index) => {
      return <AppointmentCard key={index} appointment={appointment} socket={socket} />;
    });
  }

  return (
    <div className="mx-auto">
      {!isFetching && (
        <div className="ml-20 flex flex-col space-y-4 mr-20">
          <Breadcrumbs aria-label="breadcrumbs" className="mb-2 mt-5">
          <Link component={RouterLink} color="neutral" to="../">
            Home
          </Link>
          <Typography>Appointments</Typography>
        </Breadcrumbs>
          <div className="flex justify-between items-center space-x-4 w-full mt-10">
            <RangePicker onChange={handleDateRange} format={"MM/DD/YYYY"} />

            <FormControl id="multiple-limit-tags">
              <Autocomplete
                multiple
                id="tags-default"
                placeholder="Status"
                loading={isFetching}
                options={options}
                endDecorator={
                  isFetching ? (
                    <CircularProgress size="sm" sx={{ bgcolor: "background.surface" }} />
                  ) : null
                }
                limitTags={2}
                onChange={(event, newValue) => {
                  handleSelect(newValue);
                }}
              />
            </FormControl>

            <SearchBar
              placeholder="Search for patients..."
              onChange={(value) => setSearchTerm(value)}
            />

          </div>

          {renderedAppointments}
        </div>
      )}
    </div>
  );
}

export default ViewDoctorAppointments;
