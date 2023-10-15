import { useFetchPatientAppointmentsQuery } from '../../store';
import AppointmentCard from '../components/AppointmentCard';
import { Box } from '@mui/system';
import { Link as RouterLink } from "react-router-dom";
import { Link, Typography, Breadcrumbs, FormControl, FormLabel, Autocomplete } from '@mui/joy';
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useState } from 'react';
import filter from '../utils/filter';


export default function ViewPatientAppointments() {

  const [date, setDate] = useState(null);
  const [config, setConfig] = useState({});

  const dateFormat = "MM/DD/YYYY HH:mm A";
  const { data, isFetching, isError } = useFetchPatientAppointmentsQuery();
  let content;

  if (isFetching) {
    content = <div> Loading ...</div>;
  } else if (isError) {
    content = <div> Error ... </div>;
  } else {
    let filteredData = filter(data, config);

    filteredData = filteredData.filter((pres) => {
      if (date) {
        return dayjs(pres.formattedDate, dateFormat).isSame(dayjs(date, dateFormat), 'minute');
      } else {
        return true;
      }
    });

    content = filteredData.map((appointment) => {
      return (
        // <div>
        <AppointmentCard sx={{ width: '100%' }} {...appointment} />
        // </div>
      );
    });
  }

  return (
    <Box className='w-full ml-20 mt-10 mr-20 space-y-5'>
      <Breadcrumbs aria-label="breadcrumbs" className="mb-2">
        <Link component={RouterLink} color="neutral" to="../">Home</Link>
        <Typography>Appointments</Typography>
      </Breadcrumbs>

      <Box className="flex space-x-8">

        <FormControl id="multiple-limit-tags">
          <FormLabel>Status</FormLabel>
          <Autocomplete
            multiple
            id="tags-default"
            placeholder="Status"
            options={["Completed", "Upcoming", "Cancelled"]}
            // endDecorator={
            //   isFetching ? (
            //     <CircularProgress size="sm" sx={{ bgcolor: 'background.surface' }} />
            //   ) : null
            // }
            limitTags={2}
            onChange={(event, newValue) => {
              setConfig({ ...config, status: newValue })
            }}
          />
        </ FormControl>

        <FormControl id="multiple-limit-tags">
          <FormLabel>Date</FormLabel>
          <DatePicker
            format="MM/DD/YYYY HH:mm A"
            onChange={(date, dateString) => setDate(date)}
            showTime={{ defaultValue: dayjs("00:00:00", "HH:mm:ss") }}
            className="h-full w-56"
          />
        </ FormControl>


      </Box>

      {content}
    </Box>
  );
}